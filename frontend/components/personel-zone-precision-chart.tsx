"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Target } from "lucide-react"

export function PersonalZonePrecisionChart({ cones }: { cones: any[] }) {
  if (!cones || cones.length === 0) return null

  // Extract PPM deviations
  const warmDeviations = cones.filter((c) => c.zone === "WARM").map((c) => c.ppm_deviation)
  const hotDeviations = cones.filter((c) => c.zone === "HOT").map((c) => c.ppm_deviation)

  const generateCurve = (values: number[]) => {
    if (!values.length) return []

    const points = []
    for (let x = -5; x <= 10; x += 0.25) {
      let val = 0
      values.forEach((v) => {
        val += Math.exp(-Math.pow(x - v, 2) / 1.5)
      })
      points.push({ deviation: x, value: val * 6 })
    }
    return points
  }

  const warmPoints = generateCurve(warmDeviations)
  const hotPoints = generateCurve(hotDeviations)

  const merged = warmPoints.map((p, index) => ({
    deviation: p.deviation,
    warm_zone: p.value,
    hot_zone: hotPoints[index]?.value || 0,
  }))

  return (
    <Card className="bg-card border-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <Target className="w-5 h-5 text-primary" />
          Zone Precision Analysis (Individual)
        </CardTitle>
        <CardDescription>
          Uses ONLY this trainee’s cone placements to generate a personal deviation curve.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="w-full h-80">
          <ChartContainer
            config={{
              warm_zone: { label: "Warm Zone", color: "hsl(45 93% 47%)" },
              hot_zone: { label: "Hot Zone", color: "hsl(0 84% 60%)" },
            }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={merged}
                margin={{ top: 10, right: 30, left: 40, bottom: 45 }}
              >
                <defs>
                  <linearGradient id="pgWarm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(45 93% 47%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(45 93% 47%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="pgHot" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(0 84% 60%)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="hsl(0 84% 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

                <XAxis
                  dataKey="deviation"
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "PPM Deviation (from ideal)",
                    position: "bottom",
                    dy: 20,
                  }}
                />

                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Frequency",
                    angle: -90,
                    position: "left",
                    dx: -30,
                  }}
                />

                <Tooltip content={<ChartTooltipContent />} />
                <Legend />

                <Area
                  type="monotone"
                  dataKey="warm_zone"
                  stroke="hsl(45 93% 47%)"
                  fill="url(#pgWarm)"
                />
                <Area
                  type="monotone"
                  dataKey="hot_zone"
                  stroke="hsl(0 84% 60%)"
                  fill="url(#pgHot)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}