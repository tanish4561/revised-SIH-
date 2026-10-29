"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { CommonMistake } from "@/lib/api/personal"

interface CommonMistakesProps {
    data: CommonMistake[]
}

const formatMistakeType = (type: string) => {
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

export function CommonMistakes({ data }: CommonMistakesProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="bg-card border-border h-full flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-green-500/10 p-3 rounded-full mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-semibold text-lg">No Recent Mistakes</h3>
                <p className="text-sm text-muted-foreground mt-1">Great job! You haven't made any repeated mistakes in recent sessions.</p>
            </Card>
        )
    }

    return (
        <Card className="bg-card border-border h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="w-5 h-5" />
                    Areas for Improvement
                </CardTitle>
                <CardDescription>Frequent patterns identified in your sessions</CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible className="w-full">
                    {data.map((mistake, index) => (
                        <AccordionItem key={index} value={`item-${index}`} className="border-border">
                            <AccordionTrigger className="hover:no-underline py-3">
                                <div className="flex items-center justify-between w-full pr-4 text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-destructive/10 text-destructive font-bold px-2 py-1 rounded text-xs min-w-[1.5rem] text-center">
                                            {mistake.count}
                                        </div>
                                        <span className="font-medium">{formatMistakeType(mistake.type)}</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="bg-secondary/30 p-3 rounded-md border border-border/50 text-sm">
                                    <p className="font-medium text-xs text-muted-foreground uppercase tracking-wider mb-1">Recommendation</p>
                                    <p>{mistake.recommendation}</p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    )
}
