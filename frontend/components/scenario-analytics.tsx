"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ScenarioAnalyticsProps {
  scenarioType: "rescue" | "decontamination" | "containment"
}

export function ScenarioAnalytics({ scenarioType }: ScenarioAnalyticsProps) {
  const getDataByScenario = () => {
    const scenarios: Record<string, any[]> = {
      rescue: [
        { attempt: 1, time: 5.2, success: false },
        { attempt: 2, time: 4.8, success: true },
        { attempt: 3, time: 3.9, success: true },
        { attempt: 4, time: 3.5, success: true },
      ],
      decontamination: [
        { attempt: 1, time: 8.5, success: false },
        { attempt: 2, time: 7.2, success: true },
        { attempt: 3, time: 6.1, success: true },
        { attempt: 4, time: 5.8, success: true },
      ],
      containment: [
        { attempt: 1, time: 12.0, success: false },
        { attempt: 2, time: 10.5, success: false },
        { attempt: 3, time: 8.2, success: true },
        { attempt: 4, time: 7.5, success: true },
      ],
    }
    return scenarios[scenarioType] || scenarios.rescue
  }

  const data = getDataByScenario()
  const avgTime = (data.reduce((sum, d) => sum + d.time, 0) / data.length).toFixed(1)
  const successRate = ((data.filter((d) => d.success).length / data.length) * 100).toFixed(0)

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Average Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgTime}m</p>
            <p className="text-xs text-muted-foreground">per attempt</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{successRate}%</p>
            <p className="text-xs text-muted-foreground">of attempts</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
          <CardDescription>Time per attempt across all sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ time: { label: "Time (minutes)", color: "var(--color-chart-1)" } }}
            className="h-72"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="attempt"
                  stroke="var(--color-muted-foreground)"
                  label={{ value: "Attempt #", position: "insideBottomRight", offset: -5 }}
                />
                <YAxis
                  stroke="var(--color-muted-foreground)"
                  label={{ value: "Time (min)", angle: -90, position: "insideLeft" }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="time"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-chart-1)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
