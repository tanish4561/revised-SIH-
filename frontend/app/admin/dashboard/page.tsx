"use client"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { PerformanceLeaderboard } from "@/components/performance-leaderboard"
import { TeamConsistencyCard } from "@/components/team-consistency-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  ReferenceLine,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, Activity, TrendingUp, TrendingDown, Clock, Target, Award, AlertCircle, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { getDashboardOverview } from "@/lib/api/dashboard"
import { DashboardOverviewResponse } from "@/lib/api/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CreateSessionDialog } from "@/components/create-session-dialog"

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardOverviewResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<{ day: string; total: number; failed: number; passed: number; passRate: number } | null>(null)

  // Target thresholds for benchmarks
  const TARGET_PASS_RATE = 75 // 75% acceptable threshold
  const RANK_TARGETS: Record<string, number> = {
    "Inspector": 85,
    "Sub-Inspector": 80,
    "Assistant Sub-Inspector": 75,
    "Head Constable": 70,
    "Constable": 65,
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getDashboardOverview()
        setData(result)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Format average duration from seconds to MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="admin" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="admin" />

      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">Mission Control</h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Real-time NDRF Chemical Disaster Response Training Analytics
              </p>
            </div>
            <CreateSessionDialog />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Cards - All Four Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sessions Conducted */}
          <Card className="bg-card border-border hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 ease-out cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Total Sessions</CardTitle>
                <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors">
                  <Activity className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">{data?.kpi.total_sessions || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Conducted this period</p>
            </CardContent>
          </Card>

          {/* Weekly Pass Rate */}
          <Card className={`bg-card border-border hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ease-out cursor-pointer group ${data?.kpi.pass_rate_trend === "UP"
              ? "hover:border-green-500/50"
              : "hover:border-red-500/50"
            }`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Weekly Pass Rate</CardTitle>
                <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors">
                  <Target className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-semibold text-foreground">{data?.kpi.weekly_pass_rate.toFixed(1)}%</div>
                {data && data.kpi.weekly_pass_rate >= TARGET_PASS_RATE && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">Target Met</Badge>
                )}
              </div>
              <p
                className={`text-xs mt-2 flex items-center gap-1 font-medium ${data?.kpi.pass_rate_trend === "UP" ? "text-green-500" : "text-red-500"
                  }`}
              >
                {data?.kpi.pass_rate_trend === "UP" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {data?.kpi.pass_rate_trend === "UP" ? "Improving" : "Declining"}
              </p>
            </CardContent>
          </Card>

          {/* Active Trainees */}
          <Card className="bg-card border-border hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 ease-out cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Active Trainees</CardTitle>
                <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors">
                  <Users className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">{data?.kpi.active_trainees || 0}</div>
              <p className="text-xs text-muted-foreground mt-2">Trained this week</p>
            </CardContent>
          </Card>

          {/* Avg Mission Duration */}
          <Card className="bg-card border-border hover:shadow-xl hover:scale-[1.02] hover:border-primary/50 transition-all duration-300 ease-out cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Avg. Mission Duration</CardTitle>
                <div className="p-2 bg-primary/10 group-hover:bg-primary/20 rounded-lg transition-colors">
                  <Clock className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-foreground">
                {data?.kpi.avg_duration_sec ? formatDuration(data.kpi.avg_duration_sec) : "0:00"}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Average completion time</p>
            </CardContent>
          </Card>
        </div>

        {/* Performance Leaderboard & Team Consistency Index */}
        {data && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PerformanceLeaderboard topPerformers={data.team_consistency_index.top_performers} />
            <TeamConsistencyCard data={data.team_consistency_index} />
          </div>
        )}

        {/* Weekly Session Trends Chart */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Activity className="w-5 h-5 text-primary" />
              Weekly Session Trends
            </CardTitle>
            <CardDescription className="text-sm">
              Total sessions and failed sessions over the week • Target pass rate: {TARGET_PASS_RATE}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80 flex items-center justify-center">
              <ChartContainer
                config={{
                  total: { label: "Total Sessions", color: "var(--chart-1)" },
                  failed: { label: "Failed Sessions", color: "hsl(0 84.2% 60.2%)" },
                  target: { label: `Target (${TARGET_PASS_RATE}%)`, color: "hsl(142 76% 36%)" },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={data?.weekly_activity.labels.map((day, index) => {
                      const total = data.weekly_activity.total_sessions[index] || 0
                      const failed = data.weekly_activity.failed_sessions[index] || 0
                      const passed = total - failed
                      const passRate = total > 0 ? (passed / total) * 100 : 0
                      return {
                        day,
                        total,
                        failed,
                        passed,
                        passRate: Math.round(passRate * 10) / 10,
                        target: total * (TARGET_PASS_RATE / 100),
                      }
                    }) || []}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                    onClick={(e: any) => {
                      if (e && e.activePayload && e.activePayload[0]) {
                        const payload = e.activePayload[0].payload
                        setSelectedDay(payload)
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.5} />
                    <XAxis
                      dataKey="day"
                      stroke="var(--color-muted-foreground)"
                      style={{ fontSize: "12px" }}
                      height={40}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      style={{ fontSize: "12px" }}
                      label={{ value: 'Sessions', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
                              <p className="font-semibold text-foreground mb-2 border-b border-border pb-1">{data.day}</p>
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Total Sessions:</span>
                                  <span className="font-bold text-primary">{data.total}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Passed:</span>
                                  <span className="font-semibold text-green-600">{data.passed}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Failed:</span>
                                  <span className="font-semibold text-red-600">{data.failed}</span>
                                </div>
                                <div className="flex justify-between items-center pt-1 border-t border-border">
                                  <span className="text-muted-foreground">Pass Rate:</span>
                                  <span className={`font-bold ${data.passRate >= TARGET_PASS_RATE ? "text-green-600" : "text-red-600"
                                    }`}>{data.passRate}%</span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                      cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1, strokeDasharray: "5 5" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {/* Benchmark Reference Line - Dynamically calculated per day */}
                    <Line
                      type="monotone"
                      dataKey="target"
                      stroke="hsl(142 76% 36%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      isAnimationActive={true}
                      name={`Target (${TARGET_PASS_RATE}%)`}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      stroke="var(--chart-1)"
                      strokeWidth={2.5}
                      dot={{ r: 5, strokeWidth: 2, fill: "var(--chart-1)" }}
                      activeDot={{ r: 7, strokeWidth: 2, cursor: "pointer" }}
                      isAnimationActive={true}
                    />
                    <Line
                      type="monotone"
                      dataKey="failed"
                      stroke="hsl(0 84.2% 60.2%)"
                      strokeWidth={2.5}
                      dot={{ r: 5, strokeWidth: 2, fill: "hsl(0 84.2% 60.2%)" }}
                      activeDot={{ r: 7, strokeWidth: 2, cursor: "pointer" }}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Click on data points to view detailed session breakdown
            </p>
          </CardContent>
        </Card>

        {/* Session Details Dialog */}
        {selectedDay && (
          <Dialog open={!!selectedDay} onOpenChange={() => setSelectedDay(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Session Details - {selectedDay.day}
                </DialogTitle>
                <DialogDescription>
                  Comprehensive breakdown of training sessions for this day
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted/30 rounded-lg border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
                    <p className="text-2xl font-bold text-foreground">{selectedDay.total}</p>
                  </div>
                  <div className="text-center p-4 bg-green-500/5 rounded-lg border border-green-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Passed</p>
                    <p className="text-2xl font-bold text-green-600">{selectedDay.passed}</p>
                  </div>
                  <div className="text-center p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <p className="text-xs text-muted-foreground mb-1">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{selectedDay.failed}</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-xs text-muted-foreground mb-1">Pass Rate</p>
                    <p className={`text-2xl font-bold ${selectedDay.passRate >= TARGET_PASS_RATE ? "text-green-600" : "text-red-600"
                      }`}>{selectedDay.passRate}%</p>
                  </div>
                </div>

                {/* Performance Assessment */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-foreground">Performance Assessment</h4>
                  <div className={`p-4 rounded-lg border ${selectedDay.passRate >= TARGET_PASS_RATE
                      ? "bg-green-500/10 border-green-500/30"
                      : "bg-red-500/10 border-red-500/30"
                    }`}>
                    <div className="flex items-start gap-3">
                      {selectedDay.passRate >= TARGET_PASS_RATE ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className={`font-semibold mb-1 ${selectedDay.passRate >= TARGET_PASS_RATE ? "text-green-700" : "text-red-700"
                          }`}>
                          {selectedDay.passRate >= TARGET_PASS_RATE
                            ? `✓ Above Target Threshold (${TARGET_PASS_RATE}%)`
                            : `✗ Below Target Threshold (${TARGET_PASS_RATE}%)`
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDay.passRate >= TARGET_PASS_RATE
                            ? `Training performance is ${(selectedDay.passRate - TARGET_PASS_RATE).toFixed(1)}% above the acceptable threshold. Team is meeting deployment readiness standards.`
                            : `Training performance is ${(TARGET_PASS_RATE - selectedDay.passRate).toFixed(1)}% below the acceptable threshold. Additional training sessions recommended.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Success-to-Failure Ratio</p>
                    <p className="text-lg font-bold text-foreground">
                      {selectedDay.failed > 0 ? (selectedDay.passed / selectedDay.failed).toFixed(2) : selectedDay.passed} : 1
                    </p>
                  </div>
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Gap to Target</p>
                    <p className={`text-lg font-bold ${selectedDay.passRate >= TARGET_PASS_RATE ? "text-green-600" : "text-red-600"
                      }`}>
                      {selectedDay.passRate >= TARGET_PASS_RATE ? "+" : ""}
                      {(selectedDay.passRate - TARGET_PASS_RATE).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Success Rate by Trainee Rank */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
              <Award className="w-5 h-5 text-primary" />
              Success Rate by Trainee Rank
            </CardTitle>
            <CardDescription className="text-sm">
              Performance breakdown by personnel rank • Rank-specific targets shown
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-80 flex items-center justify-center">
              <ChartContainer
                config={{
                  pass_rate: { label: "Pass Rate %", color: "var(--chart-1)" },
                  target: { label: "Target %", color: "hsl(142 76% 36%)" },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data?.success_by_rank.map(item => ({
                      ...item,
                      target: RANK_TARGETS[item.rank] || TARGET_PASS_RATE,
                      status: item.pass_rate >= (RANK_TARGETS[item.rank] || TARGET_PASS_RATE) ? "above" : "below",
                    })) || []}
                    margin={{ top: 5, right: 10, left: -20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="rank"
                      stroke="var(--color-muted-foreground)"
                      style={{ fontSize: "12px" }}
                      angle={-15}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      style={{ fontSize: "12px" }}
                      domain={[0, 100]}
                      label={{ value: 'Pass Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                          const data = payload[0].payload
                          const diff = data.pass_rate - data.target
                          return (
                            <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg p-4 min-w-[220px]">
                              <p className="font-semibold text-foreground mb-3 border-b border-border pb-2">{data.rank}</p>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Pass Rate:</span>
                                  <span className="font-bold text-primary text-base">{data.pass_rate.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Target:</span>
                                  <span className="font-semibold text-green-600">{data.target.toFixed(1)}%</span>
                                </div>
                                <div className="pt-2 border-t border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Status:</span>
                                    <div className="flex items-center gap-1">
                                      {data.status === "above" ? (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                                      ) : (
                                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                                      )}
                                      <span className={`font-semibold ${data.status === "above" ? "text-green-600" : "text-red-600"
                                        }`}>
                                        {data.status === "above" ? "Above Target" : "Below Target"}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {diff >= 0 ? "+" : ""}{diff.toFixed(1)}% from target
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                      cursor={{ fill: "hsl(var(--primary))", opacity: 0.1 }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    {/* Base Target Reference Line */}
                    <ReferenceLine
                      y={TARGET_PASS_RATE}
                      stroke="hsl(142 76% 36%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      label={{
                        value: `Base Target: ${TARGET_PASS_RATE}%`,
                        position: "insideTopRight",
                        fill: "hsl(142 76% 36%)",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                    <Bar
                      dataKey="pass_rate"
                      fill="var(--chart-1)"
                      isAnimationActive={true}
                      radius={[8, 8, 0, 0]}
                    />
                    <Bar
                      dataKey="target"
                      fill="hsl(142 76% 36%)"
                      fillOpacity={0.2}
                      isAnimationActive={true}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            {/* Rank Performance Summary */}
            {data && data.success_by_rank && data.success_by_rank.length > 0 && (
              <div className="mt-6 pt-4 border-t border-border">
                <h4 className="text-sm font-semibold mb-4 text-foreground">Rank Performance Summary</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {data.success_by_rank.map((rank) => {
                    const target = RANK_TARGETS[rank.rank] || TARGET_PASS_RATE
                    const isAboveTarget = rank.pass_rate >= target
                    const difference = rank.pass_rate - target

                    return (
                      <div
                        key={rank.rank}
                        className={`p-3 rounded-lg border transition-all hover:scale-105 cursor-pointer ${isAboveTarget
                            ? "bg-green-500/5 border-green-500/30 hover:bg-green-500/10"
                            : "bg-red-500/5 border-red-500/30 hover:bg-red-500/10"
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-foreground truncate" title={rank.rank}>
                            {rank.rank}
                          </span>
                          {isAboveTarget ? (
                            <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-muted-foreground">Rate:</span>
                            <span className="text-sm font-bold text-foreground">{rank.pass_rate.toFixed(1)}%</span>
                          </div>
                          <div className="flex items-baseline justify-between">
                            <span className="text-xs text-muted-foreground">Target:</span>
                            <span className="text-xs font-semibold text-green-600">{target}%</span>
                          </div>
                          <div className="pt-1 mt-1 border-t border-border/50">
                            <span className={`text-xs font-bold block text-center ${isAboveTarget ? "text-green-600" : "text-red-600"
                              }`}>
                              {difference > 0 ? "+" : ""}{difference.toFixed(1)}% {isAboveTarget ? "above" : "below"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
