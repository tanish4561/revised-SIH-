"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamReadinessScore } from "@/lib/api/types"
import { TrendingUp, TrendingDown, Minus, Shield, Target, Users, Clock } from "lucide-react"

interface IndividualReadinessCardProps {
  data: TeamReadinessScore
  traineeName?: string
  compact?: boolean
}

export function IndividualReadinessCard({ data, traineeName, compact = false }: IndividualReadinessCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 85) return "text-green-500 dark:text-green-400"
    if (score >= 70) return "text-yellow-500 dark:text-yellow-400"
    return "text-red-500 dark:text-red-400"
  }

  const getGaugeColor = (score: number): string => {
    if (score >= 85) return "stroke-green-500 dark:stroke-green-400"
    if (score >= 70) return "stroke-yellow-500 dark:stroke-yellow-400"
    return "stroke-red-500 dark:stroke-red-400"
  }

  const getTrendIcon = () => {
    switch (data.trend) {
      case "IMPROVING":
        return <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
      case "DECLINING":
        return <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
      default:
        return <Minus className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
    }
  }

  const getTrendColor = () => {
    switch (data.trend) {
      case "IMPROVING":
        return "text-green-500 dark:text-green-400"
      case "DECLINING":
        return "text-red-500 dark:text-red-400"
      default:
        return "text-yellow-500 dark:text-yellow-400"
    }
  }

  // Calculate circumference for circular gauge
  const radius = compact ? 50 : 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (data.overall_score / 100) * circumference

  const svgSize = compact ? 120 : 180
  const center = svgSize / 2

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className={compact ? "pb-2" : ""}>
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className={`${compact ? 'text-base' : 'text-lg'} font-semibold flex items-center gap-2`}>
              <Shield className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-primary`} />
              <span className="truncate">
                {traineeName ? `${traineeName}'s IRS` : "Individual Readiness Score (IRS)"}
              </span>
            </CardTitle>
            <CardDescription className={compact ? "text-xs" : ""}>
              {compact ? "Personal performance" : "Personal performance indicator (0-100)"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {getTrendIcon()}
            <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium ${getTrendColor()}`}>
              {data.trend}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className={compact ? "pt-2" : ""}>
        <div className={`flex flex-col ${compact ? 'gap-4' : 'md:flex-row gap-8'} items-center`}>
          {/* Circular Gauge */}
          <div className="relative flex items-center justify-center">
            <svg width={svgSize} height={svgSize} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth={compact ? "12" : "16"}
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                className={getGaugeColor(data.overall_score)}
                strokeWidth={compact ? "12" : "16"}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`${compact ? 'text-2xl' : 'text-4xl'} font-bold ${getScoreColor(data.overall_score)}`}>
                {data.overall_score.toFixed(1)}
              </span>
              <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                out of 100
              </span>
            </div>
          </div>

          {/* Component Breakdown */}
          <div className={`flex-1 ${compact ? 'space-y-2' : 'space-y-4'} w-full`}>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Target className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-primary`} />
                  <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Pass Rate</span>
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>(40%)</span>
                </div>
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground`}>
                  {data.components.pass_rate_score.toFixed(1)}
                </span>
              </div>
              <div className={`w-full bg-muted rounded-full ${compact ? 'h-1.5' : 'h-2'}`}>
                <div
                  className="bg-primary rounded-full transition-all h-full"
                  style={{ width: `${data.components.pass_rate_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Target className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-blue-500`} />
                  <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Zone Precision</span>
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>(30%)</span>
                </div>
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground`}>
                  {data.components.zone_precision_score.toFixed(1)}
                </span>
              </div>
              <div className={`w-full bg-muted rounded-full ${compact ? 'h-1.5' : 'h-2'}`}>
                <div
                  className="bg-blue-500 rounded-full transition-all h-full"
                  style={{ width: `${data.components.zone_precision_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Users className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-500`} />
                  <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Triage Accuracy</span>
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>(20%)</span>
                </div>
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground`}>
                  {data.components.triage_accuracy_score.toFixed(1)}
                </span>
              </div>
              <div className={`w-full bg-muted rounded-full ${compact ? 'h-1.5' : 'h-2'}`}>
                <div
                  className="bg-green-500 rounded-full transition-all h-full"
                  style={{ width: `${data.components.triage_accuracy_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-orange-500`} />
                  <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-foreground`}>Response Time</span>
                  <span className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>(10%)</span>
                </div>
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-semibold text-foreground`}>
                  {data.components.response_time_score.toFixed(1)}
                </span>
              </div>
              <div className={`w-full bg-muted rounded-full ${compact ? 'h-1.5' : 'h-2'}`}>
                <div
                  className="bg-orange-500 rounded-full transition-all h-full"
                  style={{ width: `${data.components.response_time_score}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {!compact && (
          <>
            {/* Summary Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Pass Rate</p>
                <p className="text-lg font-bold text-primary">{data.components.pass_rate_score.toFixed(1)}%</p>
                <p className="text-[10px] text-muted-foreground">Weight: 40%</p>
              </div>
              <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-muted-foreground mb-1">Zone Precision</p>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {data.components.zone_precision_score.toFixed(1)}%
                </p>
                <p className="text-[10px] text-muted-foreground">Weight: 30%</p>
              </div>
              <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-xs text-muted-foreground mb-1">Triage Accuracy</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {data.components.triage_accuracy_score.toFixed(1)}%
                </p>
                <p className="text-[10px] text-muted-foreground">Weight: 20%</p>
              </div>
              <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                <p className="text-xs text-muted-foreground mb-1">Response Time</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {data.components.response_time_score.toFixed(1)}%
                </p>
                <p className="text-[10px] text-muted-foreground">Weight: 10%</p>
              </div>
            </div>

            {/* Interpretation */}
            <div className={`mt-6 p-4 rounded-lg border ${data.overall_score >= 85
                ? "bg-green-500/10 border-green-500/30"
                : data.overall_score >= 70
                  ? "bg-yellow-500/10 border-yellow-500/30"
                  : "bg-red-500/10 border-red-500/30"
              }`}>
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {data.overall_score >= 85 ? (
                    <Shield className="w-5 h-5 text-green-500 dark:text-green-400" />
                  ) : data.overall_score >= 70 ? (
                    <Target className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                  ) : (
                    <Shield className="w-5 h-5 text-red-500 dark:text-red-400" />
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold mb-1 ${data.overall_score >= 85
                      ? "text-green-600 dark:text-green-400"
                      : data.overall_score >= 70
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-red-600 dark:text-red-400"
                    }`}>
                    {data.overall_score >= 85
                      ? "Excellent Individual Readiness"
                      : data.overall_score >= 70
                        ? "Good Individual Readiness"
                        : "Individual Readiness Needs Attention"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {data.overall_score >= 85
                      ? "You are performing at optimal levels across all key performance indicators. Maintain current training standards and continue excellent work."
                      : data.overall_score >= 70
                        ? "Your performance is satisfactory with minor improvements needed in specific areas. Focus on strengthening weaker components to achieve excellence."
                        : "Immediate attention required. Focus on targeted training interventions in underperforming areas. Consider additional practice and scenario-based training."}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
