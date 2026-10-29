"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Zap, BarChart3, Users, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

export default function LandingPage() {
  const { theme, setTheme } = useTheme()

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full border-b border-border bg-card/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-xl tracking-tight">NDRF VR</span>
          </div>
          <div className="flex gap-3 items-center">
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
            <Link href="/admin/dashboard">
              <Button className="bg-primary hover:bg-primary/90 shadow-sm text-sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3.5 py-1.5 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm font-medium text-primary">Advanced Training Platform</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-foreground">
              Train for <span className="text-primary">Chemical Disasters</span> with VR
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Immersive virtual reality training for NDRF personnel. Master rescue, decontamination, and containment
              protocols with real-world scenarios and AI-powered performance analytics.
            </p>
            <div className="flex gap-3 pt-4">
              <Link href="/admin/dashboard">
                <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-sm">
                  Admin Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/personnel/dashboard">
                <Button size="lg" variant="outline" className="border-border hover:bg-muted/50">
                  Personnel Portal
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-10 flex items-center justify-center min-h-96 shadow-sm">
            <div className="text-center">
              <div className="w-24 h-24 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-12 h-12 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">VR Training Simulation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-semibold mb-10 text-center text-foreground">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Realistic Scenarios", desc: "Train for actual chemical disaster situations" },
              { icon: BarChart3, title: "Performance Tracking", desc: "AI-powered analytics and progress metrics" },
              { icon: Users, title: "Team Management", desc: "Monitor and manage personnel performance" },
            ].map((feature, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6 space-y-3 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto bg-primary/5 border border-primary/20 rounded-xl p-10 text-center space-y-5">
          <h2 className="text-3xl font-semibold text-foreground">Ready to Deploy?</h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Access the full training platform and start managing your personnel today.
          </p>
          <Link href="/admin/dashboard">
            <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-sm mt-2">
              Launch Dashboard
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground">
          <p>NDRF VR Training Platform © 2025. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
