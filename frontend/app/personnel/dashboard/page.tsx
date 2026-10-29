"use client"

import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Award, User, Activity, AlertCircle, Clock, Trophy, Flame } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { getPersonalOverview, getPersonalStats } from "@/lib/api/personal"
import type { PersonalOverview, PersonalStats } from "@/lib/api/personal"
import { SkillBreakdownDisplay } from "@/components/dashboard/skill-breakdown"
import { CommonMistakes } from "@/components/dashboard/common-mistakes"
import { GasPerformanceMatrix } from "@/components/dashboard/gas-performance-matrix"
import Link from "next/link"

export default function PersonnelDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const [overview, setOverview] = useState<PersonalOverview | null>(null)
  const [stats, setStats] = useState<PersonalStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [overviewData, statsData] = await Promise.all([
          getPersonalOverview(),
          getPersonalStats()
        ])
        setOverview(overviewData)
        setStats(statsData)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      fetchData()
    }
  }, [user, authLoading])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="personnel" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="personnel" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Card className="max-w-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive mb-4">
                <AlertCircle className="w-6 h-6" />
                <p className="font-semibold">Error Loading Dashboard</p>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Format performance trend data for chart
  const chartData = overview?.performance_trend.labels.map((label, index) => ({
    day: label,
    performance: overview.performance_trend.scores[index]
  })) || []

  return (
    <div className="min-h-screen bg-background pb-12">
      <DashboardNavbar userType="personnel" />

      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Training Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.username || 'Personnel'}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Personal Details & Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-3 h-3" /> Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.pass_rate}%</span>
                <span className="text-xs text-muted-foreground">total</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-3 h-3" /> Best Score
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.best_score || 0}</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-3 h-3" /> Training Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.total_training_hours}h</span>
                <span className="text-xs text-muted-foreground">active time</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Flame className="w-3 h-3" /> Streak
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stats?.current_streak || 0}</span>
                <span className="text-xs text-muted-foreground">sessions passed</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Skills & Gas (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Skill Breakdown */}
              <div className="h-full">
                {overview?.skill_breakdown && (
                  <SkillBreakdownDisplay data={overview.skill_breakdown} />
                )}
              </div>
              {/* Gas Matrix */}
              <div className="h-full">
                {overview?.gas_performance && (
                  <GasPerformanceMatrix data={overview.gas_performance} />
                )}
              </div>
            </div>

            {/* Performance Chart */}
            {chartData.length > 0 ? (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Performance Trend</CardTitle>
                  <CardDescription>Average scores over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{ performance: { label: "Performance", color: "hsl(var(--chart-1))" } }}
                    className="h-64 w-full"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis
                          dataKey="day"
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            borderColor: 'hsl(var(--border))',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }}
                          itemStyle={{ color: 'hsl(var(--foreground))' }}
                          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="performance"
                          stroke="hsl(var(--primary))"
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* Right Column - Mistakes (1/3 width) */}
          <div className="space-y-6">
            {/* Common Mistakes */}
            {overview?.common_mistakes && (
              <CommonMistakes data={overview.common_mistakes} />
            )}
          </div>
        </div>

        {/* Recent Sessions List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest training sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {overview?.recent_sessions && overview.recent_sessions.length > 0 ? (
              <div className="divide-y divide-border">
                {overview.recent_sessions.map((session, index) => (
                  <div
                    key={index}
                    className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-12 rounded-full ${session.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium text-sm">
                          {session.gas_type} Response
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(session.date).toLocaleDateString()} at {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Score</p>
                        <p className="font-bold text-lg">{session.score}%</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${session.passed
                        ? 'bg-green-500/10 text-green-500 border-green-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}>
                        {session.passed ? 'PASSED' : 'FAILED'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No sessions completed yet. Start your first training session!
                </p>
                <Link href="/personnel/play">
                  <Button variant="outline" className="mt-4">
                    Launch Simulator
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
          {overview?.recent_sessions && overview.recent_sessions.length > 0 && (
            <div className="p-4 text-center border-t border-border">
              <Link href="/personnel/stats">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                  View All History
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
