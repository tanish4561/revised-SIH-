"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, Download, RefreshCw } from "lucide-react"
import { useState } from "react"

interface AIReportGeneratorProps {
  personnelId?: string
  scenarioId?: string
  isPersonal?: boolean
}

export function AIReportGenerator({ personnelId, scenarioId, isPersonal = false }: AIReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [report, setReport] = useState<string | null>(null)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    // Simulate AI report generation
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setReport(
      `AI Analysis Report\n\nStrengths:\n• Excellent response time in emergency protocols\n• Strong teamwork and communication\n• Quick adaptation to unexpected scenarios\n\nAreas for Improvement:\n• Decontamination procedure efficiency could improve by 15%\n• Consider additional training on containment strategies\n• Response time in high-stress scenarios needs optimization\n\nRecommendations:\n• Focus on practical decontamination drills\n• Participate in advanced containment workshops\n• Practice stress management techniques\n\nNext Steps:\n• Schedule follow-up training session\n• Monitor progress on recommended areas`,
    )
    setIsGenerating(false)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI-Generated Report
        </CardTitle>
        <CardDescription>
          {isPersonal
            ? "Personalized AI insights based on your performance"
            : "AI analysis of training performance and recommendations"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {report ? (
          <div className="p-4 bg-background rounded border border-border space-y-3">
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{report}</pre>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Click the button below to generate an AI-powered analysis report
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>
          {report && (
            <>
              <Button variant="outline" onClick={() => setReport(null)}>
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
