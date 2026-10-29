"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal, Award, TrendingUp, Star, Crown } from "lucide-react"
import { PersonnelPerformance } from "@/lib/api/types"

interface PerformanceLeaderboardProps {
  topPerformers: PersonnelPerformance[]
}

export function PerformanceLeaderboard({ topPerformers }: PerformanceLeaderboardProps) {
  // Handle empty or undefined data
  if (!topPerformers || topPerformers.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-card to-blue-500/5 border-2 border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="pb-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Performance Leaderboard
                </span>
              </CardTitle>
              <CardDescription className="mt-2 text-sm">
                Top performers ranked by overall training scores
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No performance data available</p>
            <p className="text-sm mt-2">Complete training sessions to see rankings</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Get medal icon based on position
  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Star className="w-4 h-4 text-muted-foreground" />
    }
  }

  // Get medal color based on position
  const getMedalColor = (position: number) => {
    switch (position) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30"
      case 2:
        return "from-gray-400/20 to-gray-500/5 border-gray-400/30"
      case 3:
        return "from-amber-600/20 to-amber-700/5 border-amber-600/30"
      default:
        return "from-primary/10 to-primary/5 border-primary/20"
    }
  }

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-600 dark:text-green-400"
    if (score >= 70) return "text-blue-600 dark:text-blue-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-orange-600 dark:text-orange-400"
  }

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-card to-blue-500/5 border-2 border-primary/20 shadow-xl overflow-hidden">
      <CardHeader className="pb-4 border-b border-border/50 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Performance Leaderboard
              </span>
            </CardTitle>
            <CardDescription className="mt-2 text-sm">
              Top performers ranked by overall training scores
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 px-3 py-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            Live Rankings
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-3">
          {topPerformers.slice(0, 5).map((performer, index) => {
            const position = index + 1
            const isTopThree = position <= 3
            
            return (
              <div
                key={performer.user_id}
                className={`
                  group relative overflow-hidden rounded-xl border-2 bg-gradient-to-r 
                  ${getMedalColor(position)}
                  hover:shadow-lg hover:scale-[1.02] 
                  transition-all duration-300 ease-out
                  animate-in fade-in slide-in-from-left-4
                `}
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                {/* Rank Badge */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 z-10">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-r-lg
                    ${isTopThree 
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/50' 
                      : 'bg-gradient-to-br from-primary to-blue-600'
                    }
                  `}>
                    <span className="text-white font-bold text-lg">
                      {position}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 pl-14">
                  {/* Avatar */}
                  <Avatar className={`
                    w-14 h-14 border-3 transition-transform duration-300 group-hover:scale-110
                    ${isTopThree ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/30' : 'border-primary/30'}
                  `}>
                    <AvatarFallback className={`
                      text-sm font-bold
                      ${isTopThree 
                        ? 'bg-gradient-to-br from-yellow-500 to-yellow-600 text-white' 
                        : 'bg-primary/20 text-primary'
                      }
                    `}>
                      {getInitials(performer.name)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getMedalIcon(position)}
                      <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {performer.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="outline" className="bg-background/50 border-border/50">
                        {performer.rank}
                      </Badge>
                      <span className="text-muted-foreground">
                        {performer.sessions_count} sessions
                      </span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-end gap-1">
                    <div className={`
                      text-3xl font-bold transition-transform duration-300 group-hover:scale-110
                      ${getScoreColor(performer.score)}
                    `}>
                      {performer.score.toFixed(1)}
                    </div>
                    <div className="flex items-center gap-1">
                      <div className={`
                        h-1.5 rounded-full transition-all duration-500
                        ${isTopThree ? 'w-16 bg-yellow-500' : 'w-12 bg-primary'}
                      `} 
                      style={{
                        width: `${Math.max(20, performer.score / 100 * 64)}px`
                      }}
                      />
                    </div>
                  </div>
                </div>

                {/* Shine effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer Stats */}
        {topPerformers.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Top Score</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {topPerformers[0]?.score.toFixed(1)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Avg Score</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {(topPerformers.reduce((sum, p) => sum + p.score, 0) / topPerformers.length).toFixed(1)}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Total Sessions</p>
                <p className="text-xl font-bold text-primary">
                  {topPerformers.reduce((sum, p) => sum + p.sessions_count, 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
