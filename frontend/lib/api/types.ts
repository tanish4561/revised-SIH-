// API Response Types based on Hackathon Backend Plan

// ============================================
// Page 1: Overview (Mission Control)
// ============================================

export interface DashboardKPI {
  total_sessions: number
  weekly_pass_rate: number
  pass_rate_trend: "UP" | "DOWN"
  active_trainees: number
  avg_duration_sec: number
}

export interface TeamReadinessScore {
  overall_score: number // 0-100
  components: {
    pass_rate_score: number // Weighted 40%
    zone_precision_score: number // Weighted 25%
    triage_accuracy_score: number // Weighted 20%
    response_time_score: number // Weighted 15%
  }
  trend: "IMPROVING" | "DECLINING" | "STABLE"
}

export interface TeamConsistencyIndex {
  consistency_score: number // 0-100, higher = more consistent
  variance_level: "LOW" | "MEDIUM" | "HIGH"
  performance_distribution: {
    quartile_1: number // 25th percentile
    median: number // 50th percentile
    quartile_3: number // 75th percentile
    min: number
    max: number
  }
  outliers: number[] // Scores that are outliers
  top_performers: PersonnelPerformance[] // Top performing personnel
  needs_attention: PersonnelPerformance[] // Personnel needing attention
  interpretation: string // Text description
}

export interface PersonnelPerformance {
  user_id: number
  name: string
  rank: string
  score: number
  sessions_count: number
}

export interface WeeklyActivity {
  labels: string[]
  total_sessions: number[]
  failed_sessions: number[]
}

export interface SuccessByRank {
  rank: string
  pass_rate: number
}

export interface DashboardOverviewResponse {
  kpi: DashboardKPI
  team_readiness_score: TeamReadinessScore
  team_consistency_index: TeamConsistencyIndex
  weekly_activity: WeeklyActivity
  success_by_rank: SuccessByRank[]
}

// Backend raw response from /analytics/overview
export interface BackendOverviewResponse {
  avg_completion_time: string | number  // String format "MM:SS" or number (seconds)
  avg_victims_rescued: number
  mask_compliance_rate: number
  zone_accuracy: number
  team_readiness_score: number
  team_consistency_index: number
  total_sessions: number
  pass_rate?: number  // Added in backend
  performance_distribution?: {
    quartile_1: number
    median: number
    quartile_3: number
    min: number
    max: number
  }
  outlier_scores?: number[]
  top_performers?: PersonnelPerformance[]
  needs_attention?: PersonnelPerformance[]
}

// ============================================
// Page 2: Personnel Management
// ============================================

export interface User {
  user_id: string
  name: string
  rank: string
  total_sessions: number
  last_trained_date: string
  status: "ACTIVE" | "INACTIVE" | "TRAINING"
}

export interface PersonnelResponse {
  total_count: number
  users: User[]
}

// ============================================
// Page 4: Reports (Session Detail)
// ============================================

export interface SessionMetadata {
  session_id: string
  trainee_name: string
  date: string
  result: "PASSED" | "FAILED"
  // Multiplayer support
  num_users?: number
  users?: string[]
}

// Backend PPM readings format
export interface PPMReadings {
  at_cone: number
  "5m_towards_leak": number
  "5m_away_leak": number
}

export interface ZoneDemarcation {
  boundary_type: "COLD_TO_WARM" | "WARM_TO_HOT"
  ppm_readings: PPMReadings
}

export interface ConeMetric {
  type: "COLD_WARM" | "WARM_HOT"
  zone: "WARM" | "HOT"
  user_ppm: number
  ideal_ppm: number
  ppm_deviation: number
  status: "ACCURATE" | "DANGEROUS" | "CONSERVATIVE"
}

export interface TriageMetric {
  sequence: string[]
  is_optimal: boolean
}

// Per-user mistake entry (new format from Unreal)
export interface MistakeEntry {
  user_id: number
  Mistakes: string[]
}

export interface SessionMetrics {
  time_taken: string
  completion_time?: number // Raw seconds from backend
  cones: ConeMetric[]
  zone_demarcation?: ZoneDemarcation[] // Raw backend format
  triage: TriageMetric
  victims_saved?: string[] // Raw backend: ["AM", "B", "CM"]
  failures: string[]
  mistakes?: string[] | MistakeEntry[] // Backend field name - supports both old and new format
}

// Individual AI report for a user
export interface AIReportForUser {
  user_id: number
  username: string
  report_content: string
}

export interface SessionDetailResponse {
  metadata: SessionMetadata
  metrics: SessionMetrics
  ai_reports: AIReportForUser[]  // Changed from ai_report_markdown (string) to ai_reports (array)
  gas_type: string  // Gas type for this session (chlorine, ammonia, etc.)
}

export interface SessionListItem {
  session_id: string
  trainee_name: string
  date: string
  result: "PASSED" | "FAILED"
  time_taken: string
}

export interface ReportsListResponse {
  total_count: number
  sessions: SessionListItem[]
}

// Search results from /analytics/search
export interface SearchResult {
  id: number
  session_id: number
  user: string
  users?: string[]  // For multiplayer sessions
  time: number
  created_at?: string
}

// AI Report Generation
export interface GenerateReportResponse {
  status: "pending" | "completed" | "failed"
  id: number
}

export interface AIReportResponse {
  id: number
  status: "PENDING" | "COMPLETED" | "FAILED"
  content: string
}

// ============================================
// Page 3: Analytics (Deep Dive)
// ============================================

export interface ZonePrecisionStats {
  average_ppm_deviation_warm: number
  average_ppm_deviation_hot: number
  most_common_error: "UNDERESTIMATION" | "OVERESTIMATION" | "ACCURATE"
}

export interface TriageStats {
  perfect_sequence_rate: number
  black_victim_error_rate: number
  posture_error_rate: number  // Gas-specific: wrong posture priority for gas density
}

export interface FailureType {
  type: string
  count: number
}

export interface AnalyticsAggregateResponse {
  zone_precision_stats: ZonePrecisionStats
  triage_stats: TriageStats
  top_failures: FailureType[]
}
