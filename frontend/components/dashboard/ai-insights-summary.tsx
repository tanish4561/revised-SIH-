"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Bot, Star, ArrowRight, Zap, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { AIInsights } from "@/lib/api/personal"

interface AIInsightsSummaryProps {
    data: AIInsights
}

export function AIInsightsSummary({ data }: AIInsightsSummaryProps) {
    if (!data.has_report) {
        return (
            <Card className="bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-transparent border-indigo-500/20 shadow-sm h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-indigo-500/10 p-3 rounded-full mb-3">
                    <Bot className="w-8 h-8 text-indigo-500" />
                </div>
                <h3 className="font-semibold text-lg">AI Reports Ready</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">Complete your first session to receive personalized AI analysis and coaching.</p>
            </Card>
        )
    }

    return (
        <Card className="bg-gradient-to-br from-indigo-500/[0.05] via-transparent to-transparent border-indigo-500/20 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-indigo-500">
                            <Bot className="w-5 h-5" />
                            AI Coach Insights
                        </CardTitle>
                        <CardDescription>
                            Analysis from {new Date(data.latest_report_date!).toLocaleDateString()}
                        </CardDescription>
                    </div>
                    <div className="bg-indigo-500/10 px-2 py-1 rounded text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                        Latest
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div className="text-sm leading-relaxed text-muted-foreground bg-background/50 p-3 rounded-md border border-border/50 italic">
                    "{data.summary.length > 150 ? data.summary.slice(0, 150) + "..." : data.summary}"
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 uppercase tracking-wider">
                            <Star className="w-3 h-3" /> Strengths
                        </div>
                        <ul className="text-xs space-y-1.5">
                            {data.key_strengths.slice(0, 3).map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-foreground/80">
                                    <span className="mt-0.5 w-1 h-1 rounded-full bg-green-500 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 uppercase tracking-wider">
                            <Zap className="w-3 h-3" /> Focus Areas
                        </div>
                        <ul className="text-xs space-y-1.5">
                            {data.key_weaknesses.slice(0, 3).map((item, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-foreground/80">
                                    <span className="mt-0.5 w-1 h-1 rounded-full bg-amber-500 shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 pb-4">
                <Link href="/personnel/reports" className="w-full">
                    <Button variant="outline" className="w-full h-8 text-xs border-indigo-500/30 hover:bg-indigo-500/5 hover:text-indigo-600">
                        View Full Report <ArrowRight className="w-3 h-3 ml-2" />
                    </Button>
                </Link>
            </CardFooter>
        </Card>
    )
}
