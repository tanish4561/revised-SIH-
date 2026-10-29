"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamReadinessScore } from "@/lib/api/types"
import { TrendingUp, TrendingDown, Minus, Shield, Target, Users, Clock } from "lucide-react"

interface TeamReadinessCardProps {
  data: TeamReadinessScore
}

export function TeamReadinessCard({ data }: TeamReadinessCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getGaugeColor = (score: number): string => {
    if (score >= 85) return "stroke-green-500"
    if (score >= 70) return "stroke-yellow-500"
    return "stroke-red-500"
  }

  const getTrendIcon = () => {
    switch (data.trend) {
      case "IMPROVING":
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case "DECLINING":
        return <TrendingDown className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-yellow-500" />
    }
  }

  const getTrendColor = () => {
    switch (data.trend) {
      case "IMPROVING":
        return "text-green-500"
      case "DECLINING":
        return "text-red-500"
      default:
        return "text-yellow-500"
    }
  }

  // Calculate circumference for circular gauge
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (data.overall_score / 100) * circumference

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Team Readiness Score (TRS)
            </CardTitle>
            <CardDescription>Composite performance indicator (0-100)</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>{data.trend}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular Gauge */}
          <div className="relative flex items-center justify-center">
            <svg width="180" height="180" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                stroke="hsl(var(--muted))"
                strokeWidth="16"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="90"
                cy="90"
                r={radius}
                className={getGaugeColor(data.overall_score)}
                strokeWidth="16"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-bold ${getScoreColor(data.overall_score)}`}>
                {data.overall_score.toFixed(1)}
              </span>
              <span className="text-xs text-muted-foreground">out of 100</span>
            </div>
          </div>

          {/* Component Breakdown */}
          <div className="flex-1 space-y-4 w-full">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Pass Rate</span>
                  <span className="text-xs text-muted-foreground">(40%)</span>
                </div>
                <span className="text-sm font-semibold">{data.components.pass_rate_score.toFixed(1)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${data.components.pass_rate_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Zone Precision</span>
                  <span className="text-xs text-muted-foreground">(30%)</span>
                </div>
                <span className="text-sm font-semibold">{data.components.zone_precision_score.toFixed(1)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.components.zone_precision_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Triage Accuracy</span>
                  <span className="text-xs text-muted-foreground">(20%)</span>
                </div>
                <span className="text-sm font-semibold">{data.components.triage_accuracy_score.toFixed(1)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.components.triage_accuracy_score}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium">Response Time</span>
                  <span className="text-xs text-muted-foreground">(10%)</span>
                </div>
                <span className="text-sm font-semibold">{data.components.response_time_score.toFixed(1)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all"
                  style={{ width: `${data.components.response_time_score}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Pass Rate</p>
            <p className="text-lg font-bold text-primary">{data.components.pass_rate_score.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Weight: 40%</p>
          </div>
          <div className="text-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-muted-foreground mb-1">Zone Precision</p>
            <p className="text-lg font-bold text-blue-600">{data.components.zone_precision_score.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Weight: 30%</p>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-xs text-muted-foreground mb-1">Triage Accuracy</p>
            <p className="text-lg font-bold text-green-600">{data.components.triage_accuracy_score.toFixed(1)}%</p>
            <p className="text-[10px] text-muted-foreground">Weight: 20%</p>
          </div>
          <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <p className="text-xs text-muted-foreground mb-1">Response Time</p>
            <p className="text-lg font-bold text-orange-600">{data.components.response_time_score.toFixed(1)}%</p>
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
                <Shield className="w-5 h-5 text-green-500" />
              ) : data.overall_score >= 70 ? (
                <Target className="w-5 h-5 text-yellow-500" />
              ) : (
                <Shield className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div>
              <h4 className={`font-semibold mb-1 ${data.overall_score >= 85
                  ? "text-green-600"
                  : data.overall_score >= 70
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}>
                {data.overall_score >= 85
                  ? "Excellent Team Readiness"
                  : data.overall_score >= 70
                    ? "Good Team Readiness"
                    : "Team Readiness Needs Attention"}
              </h4>
              <p className="text-sm text-muted-foreground">
                {data.overall_score >= 85
                  ? "Unit is performing at optimal levels across all key performance indicators. Maintain current training standards and protocols."
                  : data.overall_score >= 70
                    ? "Overall performance is satisfactory with minor improvements needed in specific areas. Focus on strengthening weaker components to achieve excellence."
                    : "Immediate attention required. Focus on targeted training interventions in underperforming areas. Consider additional drills and scenario-based training."}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
