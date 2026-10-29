"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as authApi from "@/lib/api/auth"

export interface User {
  id: number
  username: string
  email: string | null
  phone: string | null
  rank: string
  department: string
  experience_years: number
  unit: string | null
  certifications: string[]
  role: "admin" | "player"
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<User>
  register: (username: string, password: string) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Auto-login from stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authApi.getUserProfile()
      const token = authApi.getAuthToken()

      if (storedUser && token) {
        // Try to refresh user data from API
        try {
          const freshUser = await authApi.getProfile()
          setUser(freshUser as User)
        } catch (error) {
          // Token might be expired, use stored data for now
          setUser(storedUser as User)
        }
      }

      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (username: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      const response = await authApi.login({ username, password })
      setUser(response.user as User)
      return response.user as User
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, password: string): Promise<User> => {
    setIsLoading(true)
    try {
      const response = await authApi.register({ username, password })
      setUser(response.user as User)
      return response.user as User
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getProfile()
      setUser(freshUser as User)
    } catch (error) {
      // If refresh fails, logout
      logout()
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (undefined === context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
