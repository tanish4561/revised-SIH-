"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ConeMetric } from "@/lib/api/types"

interface ZoneDemarcationProps {
  cones: ConeMetric[]
  gasType?: string  // Gas type for this session
}

export function ZoneDemarcation({ cones, gasType = 'chlorine' }: ZoneDemarcationProps) {
  const coldWarmCone = cones.find((c) => c.type === "COLD_WARM")
  const warmHotCone = cones.find((c) => c.type === "WARM_HOT")

  // Gas-specific max PPM for gradient visualization
  const getMaxPpm = (boundaryType: string) => {
    if (boundaryType === 'COLD_WARM') {
      return gasType === 'ammonia' ? 50.0 : gasType === 'hydrogen_sulfide' ? 20.0 : gasType === 'sulfur_dioxide' ? 5.0 : 2.0
    } else {
      return gasType === 'ammonia' ? 500.0 : gasType === 'chlorine' ? 30.0 : 150.0
    }
  }

  const getConePosition = (userPpm: number, idealPpm: number, maxPpm: number): number => {
    // Calculate percentage position (0-100%)
    const position = (userPpm / maxPpm) * 100
    return Math.min(Math.max(position, 0), 100)
  }



  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Zone Demarcation Analysis</CardTitle>
          <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
            Gas: <span className="font-semibold capitalize">{gasType.replace('_', ' ')}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Cold → Warm Zone */}
        {coldWarmCone && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Cold → Warm Zone Boundary</h4>
            </div>

            {/* Gradient Bar */}
            <div className="relative h-20 rounded-lg overflow-hidden border border-border">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-200 to-yellow-300" />

              {/* Ideal Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-green-600 z-10"
                style={{ left: `${getConePosition(coldWarmCone.ideal_ppm, coldWarmCone.ideal_ppm, 1.0)}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                  Ideal: {coldWarmCone.ideal_ppm} PPM
                </div>
              </div>

              {/* User Cone Marker */}
              <div
                className={`absolute top-0 bottom-0 w-1 z-20 ${coldWarmCone.status === "ACCURATE"
                  ? "bg-green-500"
                  : coldWarmCone.status === "DANGEROUS"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                  }`}
                style={{ left: `${getConePosition(coldWarmCone.user_ppm, coldWarmCone.ideal_ppm, 1.0)}%` }}
              >
                <div
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-border bg-card"
                >
                  Your: {coldWarmCone.user_ppm} PPM
                </div>
              </div>

              {/* Zone Labels */}
              <div className="absolute top-2 left-2 text-xs font-semibold text-blue-900">COLD</div>
              <div className="absolute top-2 right-2 text-xs font-semibold text-yellow-900">WARM</div>
            </div>

            <p className="text-xs text-muted-foreground">
              Deviation: {Math.abs(coldWarmCone.user_ppm - coldWarmCone.ideal_ppm).toFixed(2)} PPM from ideal
            </p>
          </div>
        )}

        {/* Warm → Hot Zone */}
        {warmHotCone && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Warm → Hot Zone Boundary</h4>
            </div>

            {/* Gradient Bar */}
            <div className="relative h-20 rounded-lg overflow-hidden border border-border">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 via-orange-400 to-red-600" />

              {/* Ideal Marker */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-green-600 z-10"
                style={{ left: `${getConePosition(warmHotCone.ideal_ppm, warmHotCone.ideal_ppm, 20.0)}%` }}
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap">
                  Ideal: {warmHotCone.ideal_ppm} PPM
                </div>
              </div>

              {/* User Cone Marker */}
              <div
                className={`absolute top-0 bottom-0 w-1 z-20 ${warmHotCone.status === "ACCURATE"
                  ? "bg-green-500"
                  : warmHotCone.status === "DANGEROUS"
                    ? "bg-red-500"
                    : "bg-yellow-500"
                  }`}
                style={{ left: `${getConePosition(warmHotCone.user_ppm, warmHotCone.ideal_ppm, 20.0)}%` }}
              >
                <div
                  className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded whitespace-nowrap border border-border bg-card"
                >
                  Your: {warmHotCone.user_ppm} PPM
                </div>
              </div>

              {/* Zone Labels */}
              <div className="absolute top-2 left-2 text-xs font-semibold text-yellow-900">WARM</div>
              <div className="absolute top-2 right-2 text-xs font-semibold text-white">HOT</div>
            </div>

            <p className="text-xs text-muted-foreground">
              Deviation: {Math.abs(warmHotCone.user_ppm - warmHotCone.ideal_ppm).toFixed(2)} PPM from ideal
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
