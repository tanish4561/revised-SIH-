"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TriageMetric } from "@/lib/api/types"
import { CheckCircle2, XCircle, ArrowRight, Shield } from "lucide-react"

interface TriageChainProps {
  triage: TriageMetric
}

export function TriageChain({ triage }: TriageChainProps) {
  // Parse victim code to extract triage color and mask status
  const parseVictimCode = (code: string) => {
    const hasMask = code.endsWith('M')
    const triageCode = code.replace('M', '') // Remove 'M' suffix if present

    // Map codes to triage colors
    const colorMap: Record<string, string> = {
      // Old format (updated): A = YELLOW (wounded on ground), B = GREEN (wounded standing/walking)
      'A': 'YELLOW',
      'B': 'GREEN',
      // New format
      'H_Injured': 'YELLOW',
      'L_Injured': 'GREEN',
    }

    // Handle Deceased_1, Deceased_2, etc.
    let color = colorMap[triageCode]
    if (!color && triageCode.startsWith('Deceased_')) {
      color = 'BLACK'
    }

    return {
      color: color || triageCode,
      hasMask,
      rawCode: triageCode
    }
  }

  const getVictimColor = (tag: string) => {
    switch (tag) {
      case "RED":
        return "bg-red-500"
      case "YELLOW":
        return "bg-yellow-500"
      case "GREEN":
        return "bg-green-500"
      case "BLACK":
        return "bg-gray-800"
      default:
        return "bg-gray-400"
    }
  }

  const getVictimLabel = (tag: string) => {
    switch (tag) {
      case "RED":
        return "Critical (Immediate)"
      case "YELLOW":
        return "Delayed"
      case "GREEN":
        return "Minor"
      case "BLACK":
        return "Deceased"
      default:
        return tag
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Triage & Rescue Sequence</CardTitle>
          <div className="flex items-center gap-2">
            {triage.is_optimal ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-600">Optimal Sequence</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium text-red-600">Incorrect Sequence</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-3 py-6 flex-wrap">
          {triage.sequence.map((code, index) => {
            const { color, hasMask } = parseVictimCode(code)

            return (
              <div key={index} className="flex items-center gap-3">
                {/* Victim Card */}
                <div
                  className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${triage.is_optimal ? "border-green-500/30" : index === 0 ? "border-red-500" : "border-border"
                    } bg-card shadow-sm min-w-[120px] relative`}
                >
                  {/* Mask Indicator Badge */}
                  {hasMask && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-md" title="Mask Applied">
                      <Shield className="w-3 h-3" />
                    </div>
                  )}

                  <div className={`w-12 h-12 rounded-full ${getVictimColor(color)} flex items-center justify-center mb-2`}>
                    <span className="text-white font-bold text-lg">{index + 1}</span>
                  </div>
                  <p className="text-xs font-semibold text-center">{getVictimLabel(color)}</p>
                  <p className={`text-xs mt-1 px-2 py-0.5 rounded ${getVictimColor(color)} text-white`}>{color}</p>

                  {/* Mask Status Text */}
                  <div className="mt-1 flex items-center gap-1">
                    {hasMask ? (
                      <span className="text-[10px] text-blue-600 font-medium flex items-center gap-0.5">
                        <Shield className="w-3 h-3" />
                        Masked
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No Mask</span>
                    )}
                  </div>
                </div>

                {/* Arrow between victims */}
                {index < triage.sequence.length - 1 && <ArrowRight className="w-6 h-6 text-muted-foreground" />}
              </div>
            )
          })}
        </div>

        {/* Protocol Explanation */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <h4 className="text-sm font-semibold">Standard Triage Protocol</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-2" />
              <strong>RED (Immediate):</strong> Critical casualties requiring immediate care
            </li>
            <li>
              <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-2" />
              <strong>YELLOW (Delayed):</strong> Serious but stable casualties
            </li>
            <li>
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2" />
              <strong>GREEN (Minor):</strong> Walking wounded with minor injuries
            </li>
            <li>
              <span className="inline-block w-3 h-3 bg-gray-800 rounded-full mr-2" />
              <strong>BLACK (Deceased):</strong> No signs of life - evacuate last
            </li>
            <li className="mt-2 pt-2 border-t border-border">
              <Shield className="inline-block w-3 h-3 text-blue-500 mr-2" />
              <strong>Mask Applied:</strong> Indicates oxygen/gas mask was provided to victim
            </li>
          </ul>
        </div>

        {!triage.is_optimal && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-600">
              <strong>Protocol Violation:</strong> The rescue sequence did not follow standard triage priorities. Review
              SOP-03 for proper casualty assessment and evacuation order.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
