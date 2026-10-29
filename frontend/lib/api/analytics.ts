import { AnalyticsAggregateResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

/**
 * Fetches aggregated analytics data for deep dive analysis
 * GET /api/analytics/aggregate
 */
export async function getAnalyticsAggregate(): Promise<AnalyticsAggregateResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/aggregate`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText} `)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to fetch analytics aggregate:", error)

    // Mock data for development
    return {
      zone_precision_stats: {
        average_ppm_deviation_warm: 1.5,
        average_ppm_deviation_hot: 4.2,
        most_common_error: "UNDERESTIMATION",
      },
      triage_stats: {
        perfect_sequence_rate: 65.0,
        black_victim_error_rate: 10.0,
        posture_error_rate: 0.0,  // Gas-specific posture errors
      },
      top_failures: [
        { type: "ZONE_VIOLATION_WARM", count: 45 },
        { type: "OXYGEN_DEPLETION", count: 12 },
        { type: "TRIAGE_PROTOCOL_ERROR", count: 8 },
        { type: "PPE_VIOLATION", count: 6 },
        { type: "TIME_EXCEEDED", count: 5 },
      ],
    }
  }
}
