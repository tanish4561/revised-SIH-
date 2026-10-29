"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts"
import { 
  Award, 
  Target, 
  Users, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpCircle,
  ArrowDownCircle,
  Minus,
  TrendingUp
} from "lucide-react"
import { TeamReadinessScore } from "@/lib/api/types"
import { IndividualReadinessCard } from "./individual-readiness-card"

// Define the trainee performance data structure
export interface TraineePerformance {
  id: string
  name: string
  rank: string
  
  // Core metrics (0-100 scale)
  zone_precision_score: number
  triage_accuracy_score: number
  speed_score: number
  protocol_compliance_score: number
  decision_making_score: number
  overall_score: number
  
  // Detailed stats
  total_sessions: number
  passed_sessions: number
  pass_rate: number
  avg_completion_time: number
  avg_ppm_deviation: number
  perfect_triage_count: number
  
  // Percentile rankings (0-100, where 90 = top 10%)
  percentile_zone_precision: number
  percentile_triage: number
  percentile_speed: number
  percentile_overall: number
}

interface ComparativePerformanceProps {
  isExpanded: boolean
  trainee1: TraineePerformance
  trainee2: TraineePerformance
  teamAverage: TraineePerformance
  trainee1IRS?: TeamReadinessScore
  trainee2IRS?: TeamReadinessScore
}

export function ComparativePerformance({
  isExpanded,
  trainee1,
  trainee2,
  teamAverage,
  trainee1IRS,
  trainee2IRS,
}: ComparativePerformanceProps) {
  
  // Helper: Get color based on percentile ranking - Dark mode compatible
  const getPercentileColor = (percentile: number) => {
    if (percentile >= 85) return "text-green-600 dark:text-green-400"
    if (percentile >= 70) return "text-blue-600 dark:text-blue-400"
    if (percentile >= 50) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
  }

  // Helper: Get badge styling based on percentile
  const getPercentileBadge = (percentile: number) => {
    if (percentile >= 85) return "bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30"
    if (percentile >= 70) return "bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30"
    if (percentile >= 50) return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300 border-yellow-500/30"
    return "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30"
  }

  // Helper: Get comparison icon (arrows or dash)
  const getComparisonIcon = (value1: number, value2: number, lowerIsBetter = false) => {
    const diff = Math.abs(value1 - value2)
    if (diff < 2) return <Minus className="w-4 h-4 text-muted-foreground" />
    
    if (lowerIsBetter) {
      return value1 < value2 
        ? <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        : <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
    }
    
    return value1 > value2 
      ? <ArrowUpCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
      : <ArrowDownCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
  }

  // Helper: Calculate difference between values
  const getDifference = (value1: number, value2: number) => {
    const diff = value1 - value2
    return diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1)
  }

  // Prepare data for radar chart (5 metrics)
  const radarData = [
    {
      metric: "Zone Precision",
      [trainee1.name]: trainee1.zone_precision_score,
      [trainee2.name]: trainee2.zone_precision_score,
      Team: teamAverage.zone_precision_score,
    },
    {
      metric: "Triage Accuracy",
      [trainee1.name]: trainee1.triage_accuracy_score,
      [trainee2.name]: trainee2.triage_accuracy_score,
      Team: teamAverage.triage_accuracy_score,
    },
    {
      metric: "Speed",
      [trainee1.name]: trainee1.speed_score,
      [trainee2.name]: trainee2.speed_score,
      Team: teamAverage.speed_score,
    },
    {
      metric: "Protocol",
      [trainee1.name]: trainee1.protocol_compliance_score,
      [trainee2.name]: trainee2.protocol_compliance_score,
      Team: teamAverage.protocol_compliance_score,
    },
    {
      metric: "Decision Making",
      [trainee1.name]: trainee1.decision_making_score,
      [trainee2.name]: trainee2.decision_making_score,
      Team: teamAverage.decision_making_score,
    },
  ]

  if (!isExpanded) return null

  return (
    <div className="overflow-hidden transition-all duration-500 ease-in-out animate-in fade-in slide-in-from-top-8">
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-blue-500/5 shadow-xl">
        <CardContent className="pt-6">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Trainee Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-500">
              {/* Trainee 1 Card */}
              <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{trainee1.name}</CardTitle>
                      <Badge className="mt-2 bg-primary/20 text-primary border-primary/30">{trainee1.rank}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {trainee1.overall_score}
                      </div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Sessions</p>
                      <p className="font-semibold text-foreground">
                        {trainee1.passed_sessions}/{trainee1.total_sessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pass Rate</p>
                      <p className="font-semibold text-foreground">{trainee1.pass_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg Time</p>
                      <p className="font-semibold text-foreground">{trainee1.avg_completion_time.toFixed(1)}m</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Ranking</p>
                      <Badge className={`text-xs ${getPercentileBadge(trainee1.percentile_overall)}`}>
                        Top {100 - trainee1.percentile_overall}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trainee 2 Card */}
              <Card className="border-2 border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg text-foreground">{trainee2.name}</CardTitle>
                      <Badge className="mt-2 bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30">{trainee2.rank}</Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {trainee2.overall_score}
                      </div>
                      <p className="text-xs text-muted-foreground">Overall Score</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Sessions</p>
                      <p className="font-semibold text-foreground">
                        {trainee2.passed_sessions}/{trainee2.total_sessions}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Pass Rate</p>
                      <p className="font-semibold text-foreground">{trainee2.pass_rate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Avg Time</p>
                      <p className="font-semibold text-foreground">{trainee2.avg_completion_time.toFixed(1)}m</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Ranking</p>
                      <Badge className={`text-xs ${getPercentileBadge(trainee2.percentile_overall)}`}>
                        Top {100 - trainee2.percentile_overall}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Individual Readiness Score (IRS) Comparison */}
            {trainee1IRS && trainee2IRS && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-300 delay-300">
                  <div className="h-px bg-border flex-1" />
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Individual Readiness Score Comparison
                  </h3>
                  <div className="h-px bg-border flex-1" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-left-4 duration-500 delay-400">
                  <IndividualReadinessCard 
                    data={trainee1IRS} 
                    traineeName={trainee1.name}
                    compact={true}
                  />
                  <IndividualReadinessCard 
                    data={trainee2IRS} 
                    traineeName={trainee2.name}
                    compact={true}
                  />
                </div>
              </div>
            )}

            {/* Radar Chart - Strengths & Weaknesses */}
            <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Target className="w-5 h-5 text-primary" />
                  Skills Radar - Strengths & Weaknesses
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Multi-dimensional performance comparison across key metrics (100 = perfect)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-80 md:h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis 
                        dataKey="metric" 
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                      />
                      <PolarRadiusAxis 
                        angle={90} 
                        domain={[0, 100]}
                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                      />
                      
                      <Radar
                        name={trainee1.name}
                        dataKey={trainee1.name}
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      
                      <Radar
                        name={trainee2.name}
                        dataKey={trainee2.name}
                        stroke="hsl(217, 91%, 60%)"
                        fill="hsl(217, 91%, 60%)"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                      
                      <Radar
                        name="Team Avg"
                        dataKey="Team"
                        stroke="hsl(142, 76%, 36%)"
                        fill="hsl(142, 76%, 36%)"
                        fillOpacity={0.1}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                      />
                      
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          color: 'hsl(var(--foreground))'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

          {/* Percentile Rankings - Side by Side */}
          <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700">
            {/* Trainee 1 Percentiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-primary" />
                  {trainee1.name} - Percentile Rankings
                </CardTitle>
                <CardDescription>Performance ranking among all trainees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zone Precision Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Zone Precision</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee1.percentile_zone_precision)} border`}>
                      Top {100 - trainee1.percentile_zone_precision}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${trainee1.percentile_zone_precision}%` }}
                    />
                  </div>
                </div>

                {/* Triage Accuracy Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Triage Accuracy</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee1.percentile_triage)} border`}>
                      Top {100 - trainee1.percentile_triage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${trainee1.percentile_triage}%` }}
                    />
                  </div>
                </div>

                {/* Speed Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Mission Speed</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee1.percentile_speed)} border`}>
                      Top {100 - trainee1.percentile_speed}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${trainee1.percentile_speed}%` }}
                    />
                  </div>
                </div>

                {/* Overall Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Overall Performance</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee1.percentile_overall)} border`}>
                      Top {100 - trainee1.percentile_overall}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${trainee1.percentile_overall}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trainee 2 Percentiles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-blue-600" />
                  {trainee2.name} - Percentile Rankings
                </CardTitle>
                <CardDescription>Performance ranking among all trainees</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Zone Precision Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Zone Precision</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee2.percentile_zone_precision)} border`}>
                      Top {100 - trainee2.percentile_zone_precision}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${trainee2.percentile_zone_precision}%` }}
                    />
                  </div>
                </div>

                {/* Triage Accuracy Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Triage Accuracy</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee2.percentile_triage)} border`}>
                      Top {100 - trainee2.percentile_triage}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${trainee2.percentile_triage}%` }}
                    />
                  </div>
                </div>

                {/* Speed Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Mission Speed</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee2.percentile_speed)} border`}>
                      Top {100 - trainee2.percentile_speed}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${trainee2.percentile_speed}%` }}
                    />
                  </div>
                </div>

                {/* Overall Percentile */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Overall Performance</span>
                    </div>
                    <Badge className={`${getPercentileBadge(trainee2.percentile_overall)} border`}>
                      Top {100 - trainee2.percentile_overall}%
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${trainee2.percentile_overall}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Metrics Comparison */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[900ms]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Detailed Metrics Comparison
              </CardTitle>
              <CardDescription>
                Head-to-head performance breakdown with variance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Pass Rate Comparison */}
                <div className="grid grid-cols-[200px_1fr_auto_1fr] gap-4 items-center">
                  <span className="font-medium text-sm">Pass Rate</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {trainee1.pass_rate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    {getComparisonIcon(trainee1.pass_rate, trainee2.pass_rate)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {getDifference(trainee1.pass_rate, trainee2.pass_rate)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-blue-600">
                      {trainee2.pass_rate.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Avg Completion Time (lower is better) */}
                <div className="grid grid-cols-[200px_1fr_auto_1fr] gap-4 items-center">
                  <span className="font-medium text-sm">Avg Completion Time</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {trainee1.avg_completion_time.toFixed(1)} min
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    {getComparisonIcon(trainee1.avg_completion_time, trainee2.avg_completion_time, true)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {getDifference(trainee1.avg_completion_time, trainee2.avg_completion_time)} min
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-blue-600">
                      {trainee2.avg_completion_time.toFixed(1)} min
                    </span>
                  </div>
                </div>

                {/* PPM Deviation (lower is better) */}
                <div className="grid grid-cols-[200px_1fr_auto_1fr] gap-4 items-center">
                  <span className="font-medium text-sm">Avg PPM Deviation</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      ±{trainee1.avg_ppm_deviation.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    {getComparisonIcon(trainee1.avg_ppm_deviation, trainee2.avg_ppm_deviation, true)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {getDifference(trainee1.avg_ppm_deviation, trainee2.avg_ppm_deviation)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-blue-600">
                      ±{trainee2.avg_ppm_deviation.toFixed(1)}
                    </span>
                  </div>
                </div>

                {/* Perfect Triage Count */}
                <div className="grid grid-cols-[200px_1fr_auto_1fr] gap-4 items-center">
                  <span className="font-medium text-sm">Perfect Triage Sessions</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-primary">
                      {trainee1.perfect_triage_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    {getComparisonIcon(trainee1.perfect_triage_count, trainee2.perfect_triage_count)}
                    <span className="text-xs text-muted-foreground ml-1">
                      {getDifference(trainee1.perfect_triage_count, trainee2.perfect_triage_count)}
                    </span>
                  </div>
                  <div>
                    <span className="text-lg font-bold text-blue-600">
                      {trainee2.perfect_triage_count}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployment Readiness Assessment */}
          <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-[1100ms]">
            {/* Trainee 1 Readiness */}
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  {trainee1.name} - Deployment Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badge */}
                {trainee1.pass_rate >= 75 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Ready for Field Deployment</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Requires Additional Training</span>
                  </div>
                )}
                
                {/* Strengths */}
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Strengths:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {trainee1.zone_precision_score >= 80 && 
                      <li>Excellent zone demarcation accuracy</li>}
                    {trainee1.triage_accuracy_score >= 80 && 
                      <li>Strong triage protocol compliance</li>}
                    {trainee1.speed_score >= 80 && 
                      <li>Fast mission completion times</li>}
                    {trainee1.protocol_compliance_score >= 80 && 
                      <li>Consistent protocol adherence</li>}
                    {trainee1.decision_making_score >= 80 && 
                      <li>Excellent decision-making under pressure</li>}
                    {trainee1.zone_precision_score < 80 && trainee1.triage_accuracy_score < 80 && 
                     trainee1.speed_score < 80 && trainee1.protocol_compliance_score < 80 && 
                     trainee1.decision_making_score < 80 && 
                      <li>Shows potential for improvement</li>}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Areas for Improvement:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {trainee1.zone_precision_score < 70 && 
                      <li>Zone placement precision needs work</li>}
                    {trainee1.triage_accuracy_score < 70 && 
                      <li>Review triage color coding protocols</li>}
                    {trainee1.speed_score < 70 && 
                      <li>Work on decision-making speed</li>}
                    {trainee1.protocol_compliance_score < 70 && 
                      <li>Focus on protocol compliance</li>}
                    {trainee1.decision_making_score < 70 && 
                      <li>Enhance situational assessment skills</li>}
                    {trainee1.zone_precision_score >= 70 && trainee1.triage_accuracy_score >= 70 && 
                     trainee1.speed_score >= 70 && trainee1.protocol_compliance_score >= 70 && 
                     trainee1.decision_making_score >= 70 && 
                      <li>Continue maintaining current performance standards</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Trainee 2 Readiness */}
            <Card className="border-2 border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  {trainee2.name} - Deployment Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badge */}
                {trainee2.pass_rate >= 75 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Ready for Field Deployment</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Requires Additional Training</span>
                  </div>
                )}
                
                {/* Strengths */}
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Strengths:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {trainee2.zone_precision_score >= 80 && 
                      <li>Excellent zone demarcation accuracy</li>}
                    {trainee2.triage_accuracy_score >= 80 && 
                      <li>Strong triage protocol compliance</li>}
                    {trainee2.speed_score >= 80 && 
                      <li>Fast mission completion times</li>}
                    {trainee2.protocol_compliance_score >= 80 && 
                      <li>Consistent protocol adherence</li>}
                    {trainee2.decision_making_score >= 80 && 
                      <li>Excellent decision-making under pressure</li>}
                    {trainee2.zone_precision_score < 80 && trainee2.triage_accuracy_score < 80 && 
                     trainee2.speed_score < 80 && trainee2.protocol_compliance_score < 80 && 
                     trainee2.decision_making_score < 80 && 
                      <li>Shows potential for improvement</li>}
                  </ul>
                </div>

                {/* Areas for Improvement */}
                <div className="space-y-2 text-sm">
                  <p className="font-medium">Areas for Improvement:</p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    {trainee2.zone_precision_score < 70 && 
                      <li>Zone placement precision needs work</li>}
                    {trainee2.triage_accuracy_score < 70 && 
                      <li>Review triage color coding protocols</li>}
                    {trainee2.speed_score < 70 && 
                      <li>Work on decision-making speed</li>}
                    {trainee2.protocol_compliance_score < 70 && 
                      <li>Focus on protocol compliance</li>}
                    {trainee2.decision_making_score < 70 && 
                      <li>Enhance situational assessment skills</li>}
                    {trainee2.zone_precision_score >= 70 && trainee2.triage_accuracy_score >= 70 && 
                     trainee2.speed_score >= 70 && trainee2.protocol_compliance_score >= 70 && 
                     trainee2.decision_making_score >= 70 && 
                      <li>Continue maintaining current performance standards</li>}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
  )
}
