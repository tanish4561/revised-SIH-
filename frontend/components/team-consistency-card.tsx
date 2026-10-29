"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TeamConsistencyIndex } from "@/lib/api/types"
import { AlertTriangle, CheckCircle2, TrendingUp, Award, TrendingDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TeamConsistencyCardProps {
  data: TeamConsistencyIndex
}

export function TeamConsistencyCard({ data }: TeamConsistencyCardProps) {
  const getVarianceColor = (level: string): string => {
    switch (level) {
      case "LOW":
        return "text-green-500"
      case "MEDIUM":
        return "text-yellow-500"
      case "HIGH":
        return "text-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getVarianceIcon = () => {
    switch (data.variance_level) {
      case "LOW":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "MEDIUM":
        return <TrendingUp className="w-5 h-5 text-yellow-500" />
      case "HIGH":
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  const getVarianceBadge = () => {
    switch (data.variance_level) {
      case "LOW":
        return "bg-green-500/20 text-green-600 border-green-500/30"
      case "MEDIUM":
        return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30"
      case "HIGH":
        return "bg-red-500/20 text-red-600 border-red-500/30"
    }
  }

  // Calculate positions for box plot
  const min = data.performance_distribution.min
  const max = data.performance_distribution.max
  const range = max - min

  const getPosition = (value: number): number => {
    return ((value - min) / range) * 100
  }

  const q1Pos = getPosition(data.performance_distribution.quartile_1)
  const medianPos = getPosition(data.performance_distribution.median)
  const q3Pos = getPosition(data.performance_distribution.quartile_3)

  // Get personnel data from API response
  const topPerformers = data.top_performers || []
  const needsAttention = data.needs_attention || []
  
  // Get outlier scores for visualization (fallback to filtering if not provided)
  const topPerformerScores = data.outliers.filter(score => score > data.performance_distribution.quartile_3)
  const needsAttentionScores = data.outliers.filter(score => score < data.performance_distribution.quartile_1)

  // Edge case: handle very close Q1/Q3 values
  const hasSpread = q3Pos - q1Pos > 5 // At least 5% width for visibility

  return (
    <Card className="bg-card border-border shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Team Consistency Index (TCI)
            </CardTitle>
            <CardDescription className="mt-1">Performance variance and distribution analysis</CardDescription>
          </div>
          <Badge 
            variant="outline" 
            className={`px-3 py-1 text-sm font-medium ${
              data.variance_level === "LOW" 
                ? "bg-green-500/10 text-green-600 border-green-500/30" 
                : data.variance_level === "MEDIUM"
                ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
                : "bg-red-500/10 text-red-600 border-red-500/30"
            }`}
          >
            {getVarianceIcon()}
            <span className="ml-1.5">{data.variance_level} Variance</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Consistency Score */}
        <div className="bg-muted/30 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Consistency Score</span>
            <span className="text-3xl font-bold text-primary">{data.consistency_score.toFixed(1)}<span className="text-lg text-muted-foreground">/100</span></span>
          </div>
          <div className="w-full bg-muted rounded-full h-3 shadow-inner">
            <div
              className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${data.consistency_score}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Higher score indicates more consistent team performance
          </p>
        </div>

        {/* Box Plot Visualization */}
        <div>
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Performance Distribution (Box Plot)
          </h4>

          {/* Scale labels */}
          <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
            <span className="font-medium">{min.toFixed(0)}%</span>
            <span className="font-medium">{((min + max) / 2).toFixed(0)}%</span>
            <span className="font-medium">{max.toFixed(0)}%</span>
          </div>

          {/* Box plot */}
          <div className="relative h-20 bg-muted/30 rounded-lg border border-border/50 mb-10">
            {/* Whisker line (min to max) */}
            <div
              className="absolute top-1/2 h-0.5 bg-border"
              style={{ left: '2%', right: '2%' }}
            />

            {/* Box (Q1 to Q3) */}
            <div
              className="absolute top-1/4 h-1/2 bg-primary/20 border-2 border-primary rounded shadow-sm"
              style={{ left: `${q1Pos}%`, width: `${Math.max(q3Pos - q1Pos, 5)}%` }}
            />

            {/* Median line */}
            <div
              className="absolute top-2 bottom-2 w-1.5 bg-primary rounded-full shadow-md z-10"
              style={{ left: `${medianPos}%`, transform: 'translateX(-50%)' }}
            />

            {/* Quartile Labels - Better positioned */}
            <div className="absolute -bottom-8 left-0 text-xs">
              <div className="text-muted-foreground font-medium">Min</div>
              <div className="text-foreground font-bold">{min.toFixed(1)}</div>
            </div>
            <div
              className="absolute -bottom-8 text-xs"
              style={{ left: `${q1Pos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="text-muted-foreground font-medium text-center">Q1</div>
              <div className="text-foreground font-bold text-center">{data.performance_distribution.quartile_1.toFixed(1)}</div>
            </div>
            <div
              className="absolute -bottom-8 text-xs"
              style={{ left: `${medianPos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="text-primary font-semibold text-center">Median</div>
              <div className="text-primary font-bold text-center">{data.performance_distribution.median.toFixed(1)}</div>
            </div>
            <div
              className="absolute -bottom-8 text-xs"
              style={{ left: `${q3Pos}%`, transform: 'translateX(-50%)' }}
            >
              <div className="text-muted-foreground font-medium text-center">Q3</div>
              <div className="text-foreground font-bold text-center">{data.performance_distribution.quartile_3.toFixed(1)}</div>
            </div>
            <div className="absolute -bottom-8 right-0 text-xs text-right">
              <div className="text-muted-foreground font-medium">Max</div>
              <div className="text-foreground font-bold">{max.toFixed(1)}</div>
            </div>

            {/* Outliers - Enhanced with color coding */}
            {data.outliers.map((outlier, index) => {
              const isTopPerformer = outlier > data.performance_distribution.quartile_3
              return (
                <div
                  key={index}
                  className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 shadow-lg transition-all hover:scale-[1.8] hover:z-20 cursor-help ${isTopPerformer
                      ? "bg-green-500 border-green-700 hover:bg-green-400 hover:shadow-green-500/60"
                      : "bg-red-500 border-red-700 hover:bg-red-400 hover:shadow-red-500/60"
                    }`}
                  style={{ left: `${getPosition(outlier)}%` }}
                  title={`${isTopPerformer ? 'Top Performer' : 'Needs Attention'}: ${outlier.toFixed(1)}%`}
                />
              )
            })}
          </div>

          {/* Outlier Legend */}
          <div className="flex items-center justify-center gap-8 text-sm mt-4 py-3 bg-muted/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-green-700 shadow-md"></div>
              <span className="text-muted-foreground font-medium">Top Performers</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 font-bold">{topPerformers.length}</Badge>
            </div>
            <div className="h-4 w-px bg-border"></div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-red-700 shadow-md"></div>
              <span className="text-muted-foreground font-medium">Needs Attention</span>
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/30 font-bold">{needsAttention.length}</Badge>
            </div>
          </div>
        </div>

        {/* Top Performers & Personnel Needing Attention Section */}
        {(topPerformers.length > 0 || needsAttention.length > 0) && (
          <div>
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Performance Outliers Analysis
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Performers */}
              {topPerformers.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/30 rounded-xl hover:border-green-500/50 transition-all shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-green-500/20">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <h5 className="font-semibold text-green-700 flex-1">Top Performers</h5>
                    <Badge className="bg-green-600 text-white shadow-sm">{topPerformers.length}</Badge>
                  </div>
                  <div className="space-y-2.5">
                    {topPerformers.slice(0, 3).map((person, idx) => (
                      <div key={person.user_id} className="flex items-center justify-between p-3 bg-background/70 border border-green-500/10 rounded-lg hover:bg-background hover:border-green-500/30 transition-all">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm text-green-700 font-semibold flex items-center gap-2 truncate">
                            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{person.name}</span>
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">{person.rank} · {person.sessions_count} sessions</span>
                        </div>
                        <span className="font-bold text-green-700 text-lg ml-3 flex-shrink-0">{person.score.toFixed(1)}%</span>
                      </div>
                    ))}
                    {topPerformers.length > 3 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-green-600 font-medium bg-green-500/10 inline-block px-3 py-1.5 rounded-full">
                          +{topPerformers.length - 3} more exceptional {topPerformers.length - 3 === 1 ? 'performer' : 'performers'}
                        </p>
                      </div>
                    )}
                    {topPerformers.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No outlier top performers yet</p>
                    )}
                  </div>
                </div>
              )}

              {/* Personnel Needing Attention */}
              {needsAttention.length > 0 && (
                <div className="p-5 bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/30 rounded-xl hover:border-red-500/50 transition-all shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-red-500/20">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                    </div>
                    <h5 className="font-semibold text-red-700 flex-1">Needs Attention</h5>
                    <Badge className="bg-red-600 text-white shadow-sm">{needsAttention.length}</Badge>
                  </div>
                  <div className="space-y-2.5">
                    {needsAttention.slice(0, 3).map((person, idx) => (
                      <div key={person.user_id} className="flex items-center justify-between p-3 bg-background/70 border border-red-500/10 rounded-lg hover:bg-background hover:border-red-500/30 transition-all">
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm text-red-700 font-semibold flex items-center gap-2 truncate">
                            <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{person.name}</span>
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">{person.rank} · {person.sessions_count} sessions</span>
                        </div>
                        <span className="font-bold text-red-700 text-lg ml-3 flex-shrink-0">{person.score.toFixed(1)}%</span>
                      </div>
                    ))}
                    {needsAttention.length > 3 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-red-600 font-medium bg-red-500/10 inline-block px-3 py-1.5 rounded-full">
                          +{needsAttention.length - 3} more requiring intervention
                        </p>
                      </div>
                    )}
                    {needsAttention.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">No personnel requiring attention</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
