"use client"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Activity, AlertTriangle, Target, TrendingDown, TrendingUp, Users, GitCompare } from "lucide-react"
import { useEffect, useState } from "react"
import { getAnalyticsAggregate } from "@/lib/api/analytics"
import { getPersonnelComparison, PersonnelComparison } from "@/lib/api/comparison"
import { AnalyticsAggregateResponse, TeamReadinessScore } from "@/lib/api/types"
import { ComparativePerformance, TraineePerformance } from "@/components/comparative-performance"

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsAggregateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Comparative Performance State
  const [comparisonExpanded, setComparisonExpanded] = useState(false)
  const [selectedTrainee1, setSelectedTrainee1] = useState<string>("")
  const [selectedTrainee2, setSelectedTrainee2] = useState<string>("")

  // Personnel comparison data from backend
  const [personnelData, setPersonnelData] = useState<PersonnelComparison[]>([])
  const [teamAverage, setTeamAverage] = useState<PersonnelComparison | null>(null)
  const [comparisonLoading, setComparisonLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getAnalyticsAggregate()
        setData(result)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    async function fetchComparisonData() {
      try {
        const result = await getPersonnelComparison()
        setPersonnelData(result.personnel)
        setTeamAverage(result.team_average)
      } catch (error) {
        console.error("Error fetching comparison data:", error)
      } finally {
        setComparisonLoading(false)
      }
    }
    fetchComparisonData()
  }, [])

  // Generate bell curve data for zone precision
  const generateBellCurveData = () => {
    if (!data) return []

    // Simulate distribution data around average deviations
    const warmAvg = data.zone_precision_stats.average_ppm_deviation_warm
    const hotAvg = data.zone_precision_stats.average_ppm_deviation_hot

    const dataPoints = []
    for (let i = -5; i <= 10; i += 0.5) {
      const warmCount = Math.exp(-Math.pow(i - warmAvg, 2) / 4) * 30
      const hotCount = Math.exp(-Math.pow(i - hotAvg, 2) / 8) * 25
      dataPoints.push({
        deviation: i,
        warm_zone: warmCount > 0.5 ? warmCount : 0,
        hot_zone: hotCount > 0.5 ? hotCount : 0,
      })
    }
    return dataPoints
  }

  const bellCurveData = data ? generateBellCurveData() : []

  // Helper function to get trainee by ID
  const getTrainee = (id: string): TraineePerformance | null => {
    const person = personnelData.find(p => p.id === id)
    if (!person) return null

    // Convert PersonnelComparison to TraineePerformance format
    return {
      id: person.id,
      name: person.name,
      rank: person.rank,
      zone_precision_score: person.zone_precision_score,
      triage_accuracy_score: person.triage_accuracy_score,
      speed_score: person.speed_score,
      protocol_compliance_score: person.protocol_compliance_score,
      decision_making_score: person.decision_making_score,
      overall_score: person.overall_score,
      total_sessions: person.total_sessions,
      passed_sessions: person.passed_sessions,
      pass_rate: person.pass_rate,
      avg_completion_time: person.avg_completion_time,
      avg_ppm_deviation: person.avg_ppm_deviation,
      perfect_triage_count: person.perfect_triage_count,
      percentile_zone_precision: person.percentile_zone_precision,
      percentile_triage: person.percentile_triage,
      percentile_speed: person.percentile_speed,
      percentile_overall: person.percentile_overall,
    }
  }

  // Convert team average to TraineePerformance format
  const getTeamAverage = (): TraineePerformance | null => {
    if (!teamAverage) return null

    return {
      id: teamAverage.id,
      name: teamAverage.name,
      rank: teamAverage.rank,
      zone_precision_score: teamAverage.zone_precision_score,
      triage_accuracy_score: teamAverage.triage_accuracy_score,
      speed_score: teamAverage.speed_score,
      protocol_compliance_score: teamAverage.protocol_compliance_score,
      decision_making_score: teamAverage.decision_making_score,
      overall_score: teamAverage.overall_score,
      total_sessions: teamAverage.total_sessions,
      passed_sessions: teamAverage.passed_sessions,
      pass_rate: teamAverage.pass_rate,
      avg_completion_time: teamAverage.avg_completion_time,
      avg_ppm_deviation: teamAverage.avg_ppm_deviation,
      perfect_triage_count: teamAverage.perfect_triage_count,
      percentile_zone_precision: teamAverage.percentile_zone_precision,
      percentile_triage: teamAverage.percentile_triage,
      percentile_speed: teamAverage.percentile_speed,
      percentile_overall: teamAverage.percentile_overall,
    }
  }

  // Calculate Individual Readiness Score (IRS) from trainee data
  const calculateIRS = (trainee: TraineePerformance | null): TeamReadinessScore | null => {
    if (!trainee) return null

    // Use the pass rate as the pass_rate_score
    const passRateScore = trainee.pass_rate

    // Weighted calculation: 40% pass rate, 30% zone precision, 20% triage, 10% speed
    const overallScore =
      (passRateScore * 0.40) +
      (trainee.zone_precision_score * 0.30) +
      (trainee.triage_accuracy_score * 0.20) +
      (trainee.speed_score * 0.10)

    // Determine trend based on percentile (simplified heuristic)
    let trend: "IMPROVING" | "DECLINING" | "STABLE" = "STABLE"
    if (trainee.percentile_overall >= 75) {
      trend = "IMPROVING"
    } else if (trainee.percentile_overall < 50) {
      trend = "DECLINING"
    }

    return {
      overall_score: overallScore,
      components: {
        pass_rate_score: passRateScore,
        zone_precision_score: trainee.zone_precision_score,
        triage_accuracy_score: trainee.triage_accuracy_score,
        response_time_score: trainee.speed_score,
      },
      trend: trend,
    }
  }

  // Handle compare button click - toggle between expand/collapse
  const handleCompare = () => {
    if (selectedTrainee1 && selectedTrainee2 && selectedTrainee1 !== selectedTrainee2) {
      setComparisonExpanded(!comparisonExpanded)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="admin" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="admin" />

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold">Analytics & Deep Dive</h1>
          <p className="text-muted-foreground mt-2">
            Advanced performance metrics and skill analysis across all trainees
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Comparative Performance Analysis Section */}
        <Card className="bg-gradient-to-br from-primary/5 to-blue-500/5 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <GitCompare className="w-6 h-6 text-primary" />
                  Comparative Performance Analysis
                </CardTitle>
                <CardDescription className="mt-2">
                  Compare individual trainee performance side-by-side with percentile rankings,
                  radar charts, and deployment readiness assessment
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Selectors and Button */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                {/* Trainee 1 Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select First Trainee</label>
                  <Select value={selectedTrainee1} onValueChange={setSelectedTrainee1}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose trainee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {comparisonLoading ? (
                        <SelectItem value="loading" disabled>Loading personnel...</SelectItem>
                      ) : personnelData.length > 0 ? (
                        personnelData.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} ({person.rank})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No personnel available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Trainee 2 Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Second Trainee</label>
                  <Select value={selectedTrainee2} onValueChange={setSelectedTrainee2}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose trainee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {comparisonLoading ? (
                        <SelectItem value="loading" disabled>Loading personnel...</SelectItem>
                      ) : personnelData.length > 0 ? (
                        personnelData.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name} ({person.rank})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>No personnel available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Compare/Collapse Button */}
                <Button
                  onClick={handleCompare}
                  disabled={!selectedTrainee1 || !selectedTrainee2 || selectedTrainee1 === selectedTrainee2}
                  className="w-full"
                  size="lg"
                  variant={comparisonExpanded ? "outline" : "default"}
                >
                  {comparisonExpanded ? (
                    <>
                      <TrendingDown className="w-4 h-4 mr-2" />
                      Collapse View
                    </>
                  ) : (
                    <>
                      <GitCompare className="w-4 h-4 mr-2" />
                      Compare Performance
                    </>
                  )}
                </Button>
              </div>

              {/* Quick Stats Preview */}
              {selectedTrainee1 && selectedTrainee2 && selectedTrainee1 !== selectedTrainee2 && getTrainee(selectedTrainee1) && getTrainee(selectedTrainee2) && (
                <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-background/50 rounded-lg border border-border">
                  {/* Trainee 1 Preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">{getTrainee(selectedTrainee1)!.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Overall Score</p>
                        <p className="font-bold text-lg">{getTrainee(selectedTrainee1)!.overall_score}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pass Rate</p>
                        <p className="font-bold text-lg">{getTrainee(selectedTrainee1)!.pass_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-bold">
                          {getTrainee(selectedTrainee1)!.passed_sessions}/{getTrainee(selectedTrainee1)!.total_sessions}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Percentile</p>
                        <p className="font-bold">Top {100 - getTrainee(selectedTrainee1)!.percentile_overall}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Trainee 2 Preview */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-600">{getTrainee(selectedTrainee2)!.name}</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Overall Score</p>
                        <p className="font-bold text-lg">{getTrainee(selectedTrainee2)!.overall_score}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pass Rate</p>
                        <p className="font-bold text-lg">{getTrainee(selectedTrainee2)!.pass_rate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sessions</p>
                        <p className="font-bold">
                          {getTrainee(selectedTrainee2)!.passed_sessions}/{getTrainee(selectedTrainee2)!.total_sessions}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Percentile</p>
                        <p className="font-bold">Top {100 - getTrainee(selectedTrainee2)!.percentile_overall}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expandable Comparison Card */}
        {selectedTrainee1 && selectedTrainee2 && selectedTrainee1 !== selectedTrainee2 && getTrainee(selectedTrainee1) && getTrainee(selectedTrainee2) && getTeamAverage() && (
          <ComparativePerformance
            isExpanded={comparisonExpanded}
            trainee1={getTrainee(selectedTrainee1)!}
            trainee2={getTrainee(selectedTrainee2)!}
            teamAverage={getTeamAverage()!}
            trainee1IRS={calculateIRS(getTrainee(selectedTrainee1))}
            trainee2IRS={calculateIRS(getTrainee(selectedTrainee2))}
          />
        )}

        {/* Key Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 transition-all duration-500">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Zone Precision (Warm)</CardTitle>
                <Target className="w-4 h-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">±{data?.zone_precision_stats.average_ppm_deviation_warm.toFixed(1)} PPM</div>
              <p className="text-xs text-muted-foreground mt-2">Average deviation from ideal</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Zone Precision (Hot)</CardTitle>
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">±{data?.zone_precision_stats.average_ppm_deviation_hot.toFixed(1)} PPM</div>
              <p className="text-xs text-muted-foreground mt-2">Average deviation from ideal</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">Perfect Triage Rate</CardTitle>
                <Users className="w-4 h-4 text-green-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data?.triage_stats.perfect_sequence_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground mt-2">Correct evacuation order</p>
            </CardContent>
          </Card>
        </div>

        {/* Zone Precision Bell Curve */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Target className="w-5 h-5 text-primary" />
              Zone Demarcation Precision Distribution
            </CardTitle>
            <CardDescription>
              PPM deviation from ideal cone placement (0 = perfect placement)
              <br />
              <strong className="text-yellow-600">Most Common Error: {data?.zone_precision_stats.most_common_error}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-96">
              <ChartContainer
                config={{
                  warm_zone: { label: "Warm Zone", color: "hsl(45 93% 47%)" },
                  hot_zone: { label: "Hot Zone", color: "hsl(0 84% 60%)" },
                }}
                className="w-full h-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={bellCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                    <defs>
                      <linearGradient id="colorWarm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(45 93% 47%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(45 93% 47%)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis
                      dataKey="deviation"
                      stroke="var(--color-muted-foreground)"
                      label={{ value: "PPM Deviation (from ideal)", position: "insideBottom", offset: -10 }}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      stroke="var(--color-muted-foreground)"
                      label={{ value: "Number of Trainees", angle: -90, position: "insideLeft" }}
                      style={{ fontSize: "12px" }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend verticalAlign="bottom" height={36} />
                    <Area
                      type="monotone"
                      dataKey="warm_zone"
                      stroke="hsl(45 93% 47%)"
                      fillOpacity={1}
                      fill="url(#colorWarm)"
                      isAnimationActive={true}
                    />
                    <Area
                      type="monotone"
                      dataKey="hot_zone"
                      stroke="hsl(0 84% 60%)"
                      fillOpacity={1}
                      fill="url(#colorHot)"
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Insight:</strong> Most trainees are placing cones{" "}
                {data?.zone_precision_stats.most_common_error === "UNDERESTIMATION"
                  ? "too deep into the danger zone (underestimation)"
                  : data?.zone_precision_stats.most_common_error === "OVERESTIMATION"
                    ? "too conservatively far from the danger zone (overestimation)"
                    : "accurately"}
                . Review gas detector response time training.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Triage Efficiency Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Users className="w-5 h-5 text-primary" />
                Triage Protocol Compliance
              </CardTitle>
              <CardDescription>Adherence to gas-specific casualty evacuation procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Perfect Sequence Rate</span>
                    <span className="text-lg font-bold text-green-600">
                      {data?.triage_stats.perfect_sequence_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${data?.triage_stats.perfect_sequence_rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trainees who followed gas-specific optimal evacuation order</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Black Victim Protocol Error</span>
                    <span className="text-lg font-bold text-red-600">
                      {data?.triage_stats.black_victim_error_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-red-500 h-3 rounded-full transition-all"
                      style={{ width: `${data?.triage_stats.black_victim_error_rate}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trainees who incorrectly prioritized deceased casualties</p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Gas Density Posture Error</span>
                    <span className="text-lg font-bold text-orange-600">
                      {data?.triage_stats?.posture_error_rate?.toFixed(1) ?? '0.0'}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-orange-500 h-3 rounded-full transition-all"
                      style={{ width: `${data?.triage_stats?.posture_error_rate ?? 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Trainees who ignored gas density (heavier gases: prioritize lying victims, lighter gases: prioritize standing victims)</p>
                </div>

                <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-sm">
                    <strong className="text-blue-600">Recommendation:</strong> {data && (
                      data.triage_stats.posture_error_rate > 10
                        ? "Conduct training on gas density effects. For heavier gases (Chlorine, SO₂), prioritize lying victims. For lighter gases (Ammonia), prioritize standing victims."
                        : data.triage_stats.black_victim_error_rate > 5
                          ? "Conduct refresher training on triage color coding. Emphasize that BLACK tagged casualties are evacuated last."
                          : "Triage protocol compliance is excellent. Maintain current training standards."
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Failure Type Breakdown */}
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Top Mission Failure Causes
              </CardTitle>
              <CardDescription>Most common reasons for mission failure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-80">
                <ChartContainer
                  config={{
                    count: { label: "Incidents", color: "hsl(0 84% 60%)" },
                  }}
                  className="w-full h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data?.top_failures || []}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis type="number" stroke="var(--color-muted-foreground)" style={{ fontSize: "12px" }} />
                      <YAxis
                        dataKey="type"
                        type="category"
                        stroke="var(--color-muted-foreground)"
                        style={{ fontSize: "11px" }}
                        width={120}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(0 84% 60%)" isAnimationActive={true} radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
