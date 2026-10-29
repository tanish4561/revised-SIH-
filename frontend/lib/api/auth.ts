/**
 * Authentication API client for login, register, and profile management
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Token storage keys
const TOKEN_KEY = 'ndrf_auth_token'
const USER_KEY = 'ndrf_user'

export interface UserProfile {
    id: number
    username: string
    email: string | null
    phone: string | null
    rank: string
    department: string
    experience_years: number
    unit: string | null
    certifications: string[]
    role: string
    is_active: boolean
    created_at: string | null
    last_login: string | null
}

export interface RegisterData {
    username: string
    password: string
}

export interface LoginData {
    username: string
    password: string
}

export interface AuthResponse {
    token: string
    user: UserProfile
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(TOKEN_KEY, token)
    }
}

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(TOKEN_KEY)
    }
    return null
}

/**
 * Remove authentication token from localStorage
 */
export function clearAuthToken(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
    }
}

/**
 * Store user profile in localStorage
 */
export function setUserProfile(user: UserProfile): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
}

/**
 * Get user profile from localStorage
 */
export function getUserProfile(): UserProfile | null {
    if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem(USER_KEY)
        if (userStr) {
            try {
                return JSON.parse(userStr)
            } catch {
                return null
            }
        }
    }
    return null
}

/**
 * Register a new user
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Registration failed')
    }

    const result = await response.json()

    // Store token and user
    setAuthToken(result.token)
    setUserProfile(result.user)

    return result
}

/**
 * Login with email and password
 */
export async function login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Login failed')
    }

    const result = await response.json()

    // Store token and user
    setAuthToken(result.token)
    setUserProfile(result.user)

    return result
}

/**
 * Logout current user
 */
export function logout(): void {
    clearAuthToken()
}

/**
 * Get current user's profile from API
 */
export async function getProfile(): Promise<UserProfile> {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            clearAuthToken()
            throw new Error('Session expired')
        }
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch profile')
    }

    const profile = await response.json()
    setUserProfile(profile)

    return profile
}

/**
 * Update current user's profile
 */
export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        if (response.status === 401) {
            clearAuthToken()
            throw new Error('Session expired')
        }
        const error = await response.json()
        throw new Error(error.error || error.message || 'Failed to update profile')
    }

    const result = await response.json()
    setUserProfile(result.user)

    return result.user
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null
}

/**
 * Get user role from stored profile
 */
export function getUserRole(): string | null {
    const user = getUserProfile()
    return user?.role || null
}
