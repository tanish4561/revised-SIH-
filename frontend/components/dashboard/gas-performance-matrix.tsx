"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Beaker } from "lucide-react"
import type { GasPerformance } from "@/lib/api/personal"

interface GasPerformanceMatrixProps {
    data: GasPerformance
}

const GAS_DISPLAY_NAMES: Record<string, string> = {
    'chlorine': 'Chlorine (Cl₂)',
    'ammonia': 'Ammonia (NH₃)',
    'sulfur_dioxide': 'Sulfur Dioxide (SO₂)',
    'hydrogen_sulfide': 'Hydrogen Sulfide (H₂S)'
}

export function GasPerformanceMatrix({ data }: GasPerformanceMatrixProps) {
    const gases = Object.entries(data).sort((a, b) => b[1].sessions - a[1].sessions)

    // Add missing gases with empty data for completeness
    Object.keys(GAS_DISPLAY_NAMES).forEach(gas => {
        if (!data[gas]) {
            gases.push([gas, { avg_score: 0, sessions: 0 }])
        }
    })

    const getScoreColor = (score: number, sessions: number) => {
        if (sessions === 0) return "text-muted-foreground"
        if (score >= 90) return "text-green-500 font-bold"
        if (score >= 70) return "text-yellow-500 font-medium"
        return "text-red-500 font-medium"
    }

    const getBarColor = (score: number, sessions: number) => {
        if (sessions === 0) return "bg-muted"
        if (score >= 90) return "bg-green-500"
        if (score >= 70) return "bg-yellow-500"
        return "bg-red-500"
    }

    return (
        <Card className="bg-card border-border h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Beaker className="w-4 h-4" />
                    Gas Proficiency
                </CardTitle>
                <CardDescription>Performance by chemical agent</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {gases.slice(0, 4).map(([type, stats]) => (
                        <div key={type} className="group">
                            <div className="flex justify-between items-center mb-1 text-sm">
                                <span className="font-medium group-hover:text-primary transition-colors">
                                    {GAS_DISPLAY_NAMES[type] || type}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="text-xs text-muted-foreground">
                                        {stats.sessions} {stats.sessions === 1 ? 'session' : 'sessions'}
                                    </span>
                                    <span className={getScoreColor(stats.avg_score, stats.sessions)}>
                                        {stats.sessions > 0 ? `${stats.avg_score}%` : 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${getBarColor(stats.avg_score, stats.sessions)} transform transition-all duration-500`}
                                    style={{ width: stats.sessions > 0 ? `${Math.max(stats.avg_score, 5)}%` : '0%' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
