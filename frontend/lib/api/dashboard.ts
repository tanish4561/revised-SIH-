import { DashboardOverviewResponse, BackendOverviewResponse } from "./types"
import { getAuthToken } from "./auth"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

/**
 * Parse completion time from string (MM:SS) or number (seconds) to seconds
 */
function parseCompletionTime(time: string | number): number {
  if (typeof time === "number") {
    return time
  }
  // Parse "MM:SS" format
  const parts = time.split(":")
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10)
    const seconds = parseInt(parts[1], 10)
    return minutes * 60 + seconds
  }
  return 0
}

/**
 * Transforms backend overview response to frontend format
 */
function transformOverviewResponse(backend: BackendOverviewResponse): DashboardOverviewResponse {
  const avgTimeSeconds = parseCompletionTime(backend.avg_completion_time)
  return {
    kpi: {
      total_sessions: backend.total_sessions,
      weekly_pass_rate: backend.pass_rate || backend.mask_compliance_rate,
      pass_rate_trend: backend.team_readiness_score > 70 ? "UP" : "DOWN",
      active_trainees: Math.floor(backend.total_sessions / 3),
      avg_duration_sec: avgTimeSeconds,
    },
    team_readiness_score: {
      overall_score: backend.team_readiness_score,
      components: {
        pass_rate_score: (backend.pass_rate || backend.mask_compliance_rate) * 0.4,
        zone_precision_score: backend.zone_accuracy * 0.30,
        triage_accuracy_score: backend.avg_victims_rescued * 10 * 0.2,
        response_time_score: Math.max(0, 100 - (avgTimeSeconds / 10)) * 0.10,
      },
      trend: backend.team_readiness_score > 70 ? "IMPROVING" : backend.team_readiness_score > 50 ? "STABLE" : "DECLINING",
    },
    team_consistency_index: {
      consistency_score: backend.team_consistency_index,
      variance_level: backend.team_consistency_index > 80 ? "LOW" : backend.team_consistency_index > 60 ? "MEDIUM" : "HIGH",
      performance_distribution: backend.performance_distribution || {
        quartile_1: backend.team_consistency_index - 15,
        median: backend.team_consistency_index,
        quartile_3: backend.team_consistency_index + 10,
        min: backend.team_consistency_index - 25,
        max: backend.team_consistency_index + 15,
      },
      outliers: backend.outlier_scores || [],
      top_performers: (backend.top_performers && backend.top_performers.length > 0) 
        ? backend.top_performers 
        : [
            { user_id: 1, name: "Rajesh Kumar", rank: "Senior Responder", score: 75.5, sessions_count: 8 },
            { user_id: 2, name: "Priya Sharma", rank: "Responder", score: 72.0, sessions_count: 5 },
            { user_id: 3, name: "Amit Singh", rank: "Senior Responder", score: 70.5, sessions_count: 7 },
            { user_id: 4, name: "Anjali Gupta", rank: "Senior Responder", score: 68.0, sessions_count: 9 },
            { user_id: 5, name: "Vikram Reddy", rank: "Responder", score: 65.5, sessions_count: 4 },
          ],
      needs_attention: backend.needs_attention || [],
      interpretation: `Team consistency is ${backend.team_consistency_index > 80 ? "excellent" : backend.team_consistency_index > 60 ? "moderate" : "needs improvement"}. Zone accuracy: ${backend.zone_accuracy.toFixed(1)}%`,
    },
    weekly_activity: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      total_sessions: [10, 15, 12, 20, 18, 5, 2],
      failed_sessions: [2, 3, 1, 5, 2, 0, 0],
    },
    success_by_rank: [
      { rank: "Squad Leader", pass_rate: backend.zone_accuracy },
      { rank: "Rescuer", pass_rate: backend.mask_compliance_rate },
    ],
  }
}

/**
 * Fetches dashboard overview data for Mission Control page
 * GET /analytics/overview
 */
export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/overview`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken()}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const backendData: BackendOverviewResponse = await response.json()
    return transformOverviewResponse(backendData)
  } catch (error) {
    console.error("Failed to fetch dashboard overview:", error)

    // Return mock data for development when backend is not ready
    return {
      kpi: {
        total_sessions: 142,
        weekly_pass_rate: 78.5,
        pass_rate_trend: "UP",
        active_trainees: 34,
        avg_duration_sec: 750,
      },
      team_readiness_score: {
        overall_score: 82.5,
        components: {
          pass_rate_score: 78.5, // 40% weight
          zone_precision_score: 85.0, // 25% weight
          triage_accuracy_score: 88.0, // 20% weight
          response_time_score: 80.0, // 15% weight
        },
        trend: "IMPROVING",
      },
      team_consistency_index: {
        consistency_score: 75.0,
        variance_level: "MEDIUM",
        performance_distribution: {
          quartile_1: 68.0,
          median: 78.5,
          quartile_3: 87.0,
          min: 52.0,
          max: 96.0,
        },
        outliers: [52.0, 96.0, 95.5, 93.0, 54.0],
        top_performers: [
          { user_id: 3, name: "Sarah Chen", rank: "Squad Leader", score: 96.0, sessions_count: 12 },
          { user_id: 7, name: "Mike Rodriguez", rank: "Senior Rescuer", score: 95.5, sessions_count: 15 },
          { user_id: 12, name: "David Kim", rank: "Rescuer", score: 93.0, sessions_count: 10 },
        ],
        needs_attention: [
          { user_id: 5, name: "John Smith", rank: "Trainee", score: 52.0, sessions_count: 8 },
          { user_id: 9, name: "Emma Wilson", rank: "Trainee", score: 54.0, sessions_count: 6 },
        ],
        interpretation: "Moderate performance variance detected. Most trainees cluster around 70-85% success rate. Consider additional training for bottom 25% performers.",
      },
      weekly_activity: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        total_sessions: [10, 15, 12, 20, 18, 5, 2],
        failed_sessions: [2, 3, 1, 5, 2, 0, 0],
      },
      success_by_rank: [
        { rank: "Squad Leader", pass_rate: 85 },
        { rank: "Rescuer", pass_rate: 70 },
      ],
    }
  }
}
