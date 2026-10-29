"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { SkillBreakdown as UnusedType } from "@/lib/api/personal" // Removed locally since we won't import the type for now to avoid unused var warning if I define local helper
import { SkillBreakdown } from "@/lib/api/personal"

interface SkillBreakdownProps {
    data: SkillBreakdown
}

export function SkillBreakdownDisplay({ data }: SkillBreakdownProps) {
    const getTrendIcon = (trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'NO_DATA') => {
        switch (trend) {
            case 'IMPROVING':
                return <TrendingUp className="w-4 h-4 text-green-500" />
            case 'DECLINING':
                return <TrendingDown className="w-4 h-4 text-red-500" />
            case 'STABLE':
                return <Minus className="w-4 h-4 text-gray-500" />
            default:
                return null
        }
    }

    const getProgressColor = (value: number) => {
        if (value >= 80) return "bg-green-500"
        if (value >= 60) return "bg-yellow-500"
        return "bg-red-500"
    }

    const skills = [
        {
            key: 'zone_accuracy',
            label: 'Zone Accuracy',
            description: 'Precision in demarcating safe, warm, and hot zones based on gas concentration.',
            ...data.zone_accuracy
        },
        {
            key: 'triage_accuracy',
            label: 'Triage Protocol',
            description: 'Accuracy in assigning correct triage colors and evacuation order.',
            ...data.triage_accuracy
        },
        {
            key: 'mask_compliance',
            label: 'Safety Compliance',
            description: 'Adherence to safety protocols like mask application before evacuation.',
            ...data.mask_compliance
        },
        {
            key: 'response_time_efficiency',
            label: 'Response Efficiency',
            description: 'Speed and efficiency of operation relative to target time.',
            ...data.response_time_efficiency
        }
    ]

    return (
        <Card className="bg-card border-border h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    Skills Breakdown
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-4 h-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="max-w-xs text-xs">Analysis of your core operational skills based on recent sessions.</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </CardTitle>
                <CardDescription>Target area proficiency</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {skills.map((skill) => (
                    <div key={skill.key} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{skill.label}</span>
                                {getTrendIcon(skill.trend)}
                            </div>
                            <span className="font-semibold">{skill.value}%</span>
                        </div>
                        <Progress value={skill.value} className={`h-2 [&>div]:${getProgressColor(skill.value)}`} />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
