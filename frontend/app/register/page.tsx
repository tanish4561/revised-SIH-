"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-context"
import { Shield, AlertCircle, Lock, Mail, Sun, Moon, CheckCircle2 } from "lucide-react"
import { useTheme } from "next-themes"

export default function RegisterPage() {
    const router = useRouter()
    const { register, isLoading } = useAuth()
    const { theme, setTheme } = useTheme()
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [passwordStrength, setPasswordStrength] = useState(0)

    // Calculate password strength
    const calculatePasswordStrength = (pass: string): number => {
        let strength = 0
        if (pass.length >= 8) strength += 25
        if (pass.length >= 12) strength += 25
        if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength += 25
        if (/[0-9]/.test(pass)) strength += 15
        if (/[^a-zA-Z0-9]/.test(pass)) strength += 10
        return Math.min(strength, 100)
    }

    const handlePasswordChange = (value: string) => {
        setPassword(value)
        setPasswordStrength(calculatePasswordStrength(value))
    }

    const getStrengthColor = () => {
        if (passwordStrength < 40) return "bg-red-500"
        if (passwordStrength < 70) return "bg-yellow-500"
        return "bg-green-500"
    }

    const getStrengthText = () => {
        if (passwordStrength < 40) return "Weak"
        if (passwordStrength < 70) return "Medium"
        return "Strong"
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        // Validation
        if (!username || !password || !confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters long")
            return
        }

        try {
            const user = await register(username, password)
            // Redirect based on user role (new users default to 'player' role)
            if (user.role === "admin") {
                router.push("/admin/dashboard")
            } else {
                router.push("/personnel/dashboard")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed. Please try again.")
        }
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-background via-background to-card/30 flex items-center justify-center px-4 py-8">
            {/* Theme Toggle Button */}
            <div className="fixed top-4 right-4">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="w-9 h-9 p-0"
                >
                    <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>

            <div className="w-full max-w-md">
                {/* Main Registration Card */}
                <Card className="bg-card/80 backdrop-blur border-border/50 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <CardHeader className="space-y-3 text-center">
                        <div className="flex justify-center mb-2">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 animate-pulse">
                                <Shield className="w-8 h-8 text-primary-foreground" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
                        <CardDescription className="text-base">Join NDRF VR Training Platform</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex gap-3 text-sm text-destructive animate-in shake">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Username</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Choose a username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="bg-background/50 border-border focus:border-primary pl-10 transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => handlePasswordChange(e.target.value)}
                                        className="bg-background/50 border-border focus:border-primary pl-10 transition-all"
                                        required
                                    />
                                </div>
                                {password && (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">Password Strength</span>
                                            <span className={`font-semibold ${passwordStrength >= 70 ? 'text-green-500' : passwordStrength >= 40 ? 'text-yellow-500' : 'text-red-500'}`}>
                                                {getStrengthText()}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                                                style={{ width: `${passwordStrength}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="bg-background/50 border-border focus:border-primary pl-10 transition-all"
                                        required
                                    />
                                    {confirmPassword && password === confirmPassword && (
                                        <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                    )}
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold py-3 rounded-lg transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Creating Account..." : "Create Account"}
                            </Button>

                            <p className="text-center text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    Sign in
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="mt-5 bg-card/60 backdrop-blur border-border/50 shadow-lg shadow-primary/5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardContent className="p-6">
                        <div className="space-y-3 text-sm">
                            <p className="font-semibold text-foreground">After registration:</p>
                            <ul className="space-y-2 text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Complete your profile with rank and certifications</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span>Access your personal training dashboard</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                    <span>View AI-generated performance reports</span>
                                </li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    )
}
