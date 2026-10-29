import { ReportsListResponse, SessionDetailResponse, SearchResult, ConeMetric, ZoneDemarcation, GenerateReportResponse, AIReportResponse } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Gas-specific ideal PPM values for zone boundaries
// Based on IDLH (Immediately Dangerous to Life or Health) and TWA (Time-Weighted Average) values
const GAS_THRESHOLDS: Record<string, Record<string, number>> = {
  chlorine: {
    COLD_TO_WARM: 0.5,   // TWA threshold
    WARM_TO_HOT: 10.0     // IDLH threshold
  },
  ammonia: {
    COLD_TO_WARM: 25.0,   // TWA threshold
    WARM_TO_HOT: 300.0    // IDLH threshold
  },
  sulfur_dioxide: {
    COLD_TO_WARM: 2.0,    // TWA threshold
    WARM_TO_HOT: 100.0    // IDLH threshold
  },
  hydrogen_sulfide: {
    COLD_TO_WARM: 10.0,   // TWA threshold
    WARM_TO_HOT: 100.0    // IDLH threshold
  }
}

/**
 * Transforms backend zone_demarcation to frontend ConeMetric format
 * Uses gas-specific ideal PPM values for accurate deviation calculation
 */
function transformZoneDemarcation(zones: ZoneDemarcation[], gasType: string = 'chlorine'): ConeMetric[] {
  const thresholds = GAS_THRESHOLDS[gasType] || GAS_THRESHOLDS['chlorine']

  return zones.map((zone) => {
    const userPpm = zone.ppm_readings.at_cone
    const boundaryType = zone.boundary_type
    const idealPpm = thresholds[boundaryType] || 5.0
    const deviation = userPpm - idealPpm

    // Determine status based on PPM gradient correctness and deviation
    const isCorrectGradient =
      zone.ppm_readings["5m_towards_leak"] > zone.ppm_readings.at_cone &&
      zone.ppm_readings.at_cone > zone.ppm_readings["5m_away_leak"]

    // Calculate tolerance based on ideal PPM (40% for warm, 50% for hot)
    const tolerance = boundaryType === 'COLD_TO_WARM' ? idealPpm * 0.4 : idealPpm * 0.5

    let status: "ACCURATE" | "DANGEROUS" | "CONSERVATIVE"
    if (isCorrectGradient && Math.abs(deviation) < tolerance) {
      status = "ACCURATE"
    } else if (deviation > 0) {
      status = "DANGEROUS"  // Too deep into danger zone
    } else {
      status = "CONSERVATIVE"  // Too far from danger zone
    }

    return {
      type: boundaryType === "COLD_TO_WARM" ? "COLD_WARM" : "WARM_HOT",
      zone: boundaryType === "COLD_TO_WARM" ? "WARM" : "HOT",
      user_ppm: userPpm,
      ideal_ppm: idealPpm,
      ppm_deviation: deviation,
      status,
    }
  })
}

/**
 * Transforms backend victims_saved array to triage sequence
 * Backend format: ["AM", "B", "CM"] where M suffix = mask used
 */
function transformVictimsSaved(victims: string[]): { sequence: string[]; is_optimal: boolean } {
  // Map victim codes to triage colors (for optimality check only)
  const triageMap: Record<string, string> = {
    // Old format (updated): A = YELLOW (wounded on ground), B = GREEN (wounded standing/walking)
    A: "YELLOW",
    B: "GREEN",
    // New victim codes
    H_Injured: "YELLOW",
    L_Injured: "GREEN",
  }

  // Also handle Deceased_1, Deceased_2, etc. -> BLACK
  const getTriageColor = (code: string): string => {
    const baseCode = code.replace("M", "") // Remove mask suffix
    if (baseCode.startsWith("Deceased_")) return "BLACK"
    return triageMap[baseCode] || "GREEN"
  }

  // PRESERVE original codes (with M suffix) for mask display
  const sequence = victims

  // Check if sequence follows optimal triage order (using mapped colors)
  const colorSequence = victims.map(getTriageColor)
  const optimalOrder = ["RED", "YELLOW", "GREEN", "BLACK"]
  const is_optimal = colorSequence.every((color, i) => {
    if (i === 0) return true
    const prevIndex = optimalOrder.indexOf(colorSequence[i - 1])
    const currIndex = optimalOrder.indexOf(color)
    return currIndex >= prevIndex
  })

  return { sequence, is_optimal }
}

/**
 * Search sessions by user name
 * GET /analytics/search?q=query
 */
export async function searchSessions(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to search sessions:", error)
    return []
  }
}

/**
 * Fetches session reports list with optional filters
 * Uses /analytics/search for queries, mock data otherwise
 */
export async function getReports(params?: {
  page?: number
  limit?: number
  search?: string
  user?: string
  start_date?: string
  end_date?: string
  status?: "PASSED" | "FAILED"
}): Promise<ReportsListResponse> {
  try {
    // If search query provided, use backend search endpoint
    if (params?.search || params?.user) {
      const query = params.search || params.user || ""
      const searchResults = await searchSessions(query)

      return {
        total_count: searchResults.length,
        sessions: searchResults.map((r) => ({
          session_id: r.session_id?.toString() || r.id.toString(),
          trainee_name: Array.isArray(r.users) ? r.users.join(", ") : r.user,
          date: r.created_at || new Date().toISOString().split("T")[0],
          result: "PASSED" as const,
          time_taken: `${Math.floor(r.time / 60)}:${(r.time % 60).toString().padStart(2, "0")}`,
        })),
      }
    }

    // Fetch all sessions from backend
    const response = await fetch(`${API_BASE_URL}/analytics/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const sessions = await response.json()

    return {
      total_count: sessions.length,
      sessions: sessions.map((s: any) => ({
        session_id: s.session_id?.toString() || s.id.toString(),
        trainee_name: Array.isArray(s.users) ? s.users.join(", ") : "Unknown",
        date: s.created_at ? new Date(s.created_at).toLocaleString() : new Date().toISOString(),
        result: s.result || "PASSED",
        time_taken: `${Math.floor(s.completion_time / 60)}:${(s.completion_time % 60).toString().padStart(2, "0")}`,
      })),
    }
  } catch (error) {
    console.error("Failed to fetch reports:", error)
    return { total_count: 0, sessions: [] }
  }
}

/**
 * Fetches detailed session report by ID
 * GET /analytics/session/<id>
 */
export async function getSessionDetail(sessionId: string): Promise<SessionDetailResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/session/${sessionId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const backendData = await response.json()

    // Transform backend response to frontend format
    const gasType = backendData.gas_type || 'chlorine'
    const cones = backendData.zone_demarcation
      ? transformZoneDemarcation(backendData.zone_demarcation, gasType)
      : []

    const triage = backendData.victims_saved
      ? transformVictimsSaved(backendData.victims_saved)
      : { sequence: [], is_optimal: true }

    const timeTaken = backendData.completion_time
      ? `${Math.floor(backendData.completion_time / 60)}:${(backendData.completion_time % 60).toString().padStart(2, "0")}`
      : "00:00"

    // Helper to count total mistakes (supports both formats)
    const countMistakes = (mistakes: any): number => {
      if (!mistakes || !Array.isArray(mistakes)) return 0
      if (mistakes.length === 0) return 0

      // Check if new format (array of objects with user_id and Mistakes)
      if (typeof mistakes[0] === 'object' && 'Mistakes' in mistakes[0]) {
        return mistakes.reduce((total, entry) => total + (entry.Mistakes?.length || 0), 0)
      }

      // Old format (flat array of strings)
      return mistakes.length
    }

    // Helper to flatten mistakes for display (supports both formats)
    const flattenMistakes = (mistakes: any): string[] => {
      if (!mistakes || !Array.isArray(mistakes)) return []
      if (mistakes.length === 0) return []

      // Check if new format
      if (typeof mistakes[0] === 'object' && 'Mistakes' in mistakes[0]) {
        return mistakes.flatMap(entry => entry.Mistakes || [])
      }

      // Old format
      return mistakes
    }

    return {
      metadata: {
        session_id: backendData.session_id?.toString() || sessionId,
        trainee_name: backendData.users?.join(", ") || "Unknown",
        date: backendData.created_at || new Date().toISOString(),
        result: countMistakes(backendData.mistakes) > 0 ? "FAILED" : "PASSED",
        num_users: backendData.num_users,
        users: backendData.users,
      },
      metrics: {
        time_taken: timeTaken,
        completion_time: backendData.completion_time,
        cones,
        zone_demarcation: backendData.zone_demarcation,
        triage,
        victims_saved: backendData.victims_saved,
        failures: flattenMistakes(backendData.mistakes),
        mistakes: backendData.mistakes,
      },
      ai_reports: backendData.ai_reports || [],  // New format: array of user reports
      gas_type: gasType,
    }
  } catch (error) {
    console.error("Failed to fetch session detail:", error)

    // Mock data for development
    return {
      metadata: {
        session_id: sessionId,
        trainee_name: "Sgt. Rajesh Kumar",
        date: "2024-12-09 14:30",
        result: "PASSED",
      },
      metrics: {
        time_taken: "12:30",
        cones: [
          {
            type: "COLD_WARM",
            zone: "WARM",
            user_ppm: 0.6,
            ideal_ppm: 0.5,
            ppm_deviation: 0.1,
            status: "ACCURATE",
          },
          {
            type: "WARM_HOT",
            zone: "HOT",
            user_ppm: 15.0,
            ideal_ppm: 10.0,
            ppm_deviation: 5.0,
            status: "DANGEROUS",
          },
        ],
        triage: {
          sequence: ["RED", "GREEN", "BLACK"],
          is_optimal: true,
        },
        failures: [],
      },
      ai_reports: [],  // Empty array for mock data
      gas_type: 'chlorine',
    }
  }
}

/**
 * Trigger AI report generation for a session
 * POST /analytics/generate-report/<session_id>
 */
export async function generateAIReport(sessionId: string): Promise<GenerateReportResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/generate-report/${sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to generate AI report:", error)
    return { status: "failed", id: 0 }
  }
}

/**
 * Get AI report status and content
 * GET /reports/<report_id>
 */
export async function getAIReport(reportId: number): Promise<AIReportResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/reports/${reportId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to get AI report:", error)
    return { id: reportId, status: "FAILED", content: "" }
  }
}

/**
 * Generate AI-powered PDF report for a user
 * POST /api/reports/user/<user_id>/generate
 */
export async function generateUserReport(userId: number): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/api/reports/user/${userId}/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to generate report');
  }

  return await response.blob();
}

/**
 * Preview AI-generated report content without creating PDF
 * GET /api/reports/user/<user_id>/preview
 */
export async function previewReportContent(userId: number) {
  const response = await fetch(`${API_BASE_URL}/api/reports/user/${userId}/preview`);

  if (!response.ok) {
    throw new Error('Failed to preview report');
  }

  return await response.json();
}

/**
 * Generate PDF reports for multiple users
 * POST /api/reports/batch-generate
 */
export async function generateBatchReports(userIds: number[]) {
  const response = await fetch(`${API_BASE_URL}/api/reports/batch-generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_ids: userIds }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate batch reports');
  }

  return await response.json();
}

/**
 * Generate summary report for all users
 * GET /api/reports/summary
 */
export async function generateSummaryReport() {
  const response = await fetch(`${API_BASE_URL}/api/reports/summary`);

  if (!response.ok) {
    throw new Error('Failed to generate summary report');
  }

  return await response.json();
}

/**
 * Generate AI-powered PDF report for a specific trainee in a session
 * POST /api/reports/session/<session_id>/trainee/<trainee_name>/generate
 */
export async function generateTraineeSessionReport(sessionId: string, traineeName: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/api/reports/session/${sessionId}/trainee/${encodeURIComponent(traineeName)}/generate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to generate trainee report');
  }

  return await response.blob();
}

/**
 * Download a PDF blob with a specified filename
 */
export function downloadPDF(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
