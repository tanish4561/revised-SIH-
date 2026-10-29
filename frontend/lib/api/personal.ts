/**
 * Personal analytics API client for authenticated user's dashboard data
 */

import { getAuthToken, clearAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface PersonalStats {
    total_sessions: number
    avg_score: number
    pass_rate: number
    total_training_hours: number
    last_session_date: string | null
    performance_trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'NO_DATA'
    rank_percentile: number
    best_score?: number
    current_streak?: number
}

export interface SessionSummary {
    session_id: number
    date: string
    gas_type: string
    score: number
    passed: boolean
    duration_minutes?: number
    zone_accuracy?: number
    triage_accuracy?: number
    has_ai_report?: boolean
}

export interface SkillMetric {
    value: number
    trend: 'IMPROVING' | 'STABLE' | 'DECLINING' | 'NO_DATA'
}

export interface SkillBreakdown {
    zone_accuracy: SkillMetric
    triage_accuracy: SkillMetric
    mask_compliance: SkillMetric
    response_time_efficiency: SkillMetric
}

export interface GasPerformance {
    [key: string]: {
        avg_score: number
        sessions: number
    }
}

export interface CommonMistake {
    type: string
    count: number
    recommendation: string
}

export interface AIInsights {
    has_report: boolean
    latest_report_date: string | null
    summary: string
    key_strengths: string[]
    key_weaknesses: string[]
}

export interface PersonalOverview {
    user_info: {
        name: string
        rank: string
        id: string
    }
    stats: {
        total_sessions: number
        avg_score: number
        pass_rate: number
        sessions_this_week: number
    }
    skill_breakdown?: SkillBreakdown
    gas_performance?: GasPerformance
    common_mistakes?: CommonMistake[]
    ai_insights?: AIInsights
    performance_trend: {
        labels: string[]
        scores: number[]
    }
    recent_sessions: SessionSummary[]
}

export interface PersonalSessionsResponse {
    total_count: number
    sessions: SessionSummary[]
}

export interface PerformanceTrendResponse {
    period: string
    labels: string[]
    scores: number[]
}

export interface PersonalReport {
    report_id: number
    session_id: number
    date: string
    status: string
    summary: string
    content: string
}

export interface PersonalReportsResponse {
    reports: PersonalReport[]
}

/**
 * Helper function to make authenticated API requests
 */
async function authenticatedFetch(url: string, options: RequestInit = {}) {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Not authenticated')
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    })

    if (!response.ok) {
        if (response.status === 401) {
            clearAuthToken()
            throw new Error('Session expired. Please login again.')
        }
        const error = await response.json()
        throw new Error(error.message || error.error || 'Request failed')
    }

    return response.json()
}

/**
 * Get personal dashboard overview
 */
export async function getPersonalOverview(): Promise<PersonalOverview> {
    return authenticatedFetch(`${API_BASE_URL}/analytics/personal/overview`)
}

/**
 * Get personal statistics
 */
export async function getPersonalStats(): Promise<PersonalStats> {
    return authenticatedFetch(`${API_BASE_URL}/users/me/stats`)
}

/**
 * Get personal training sessions with optional filters
 */
export async function getPersonalSessions(filters?: {
    page?: number
    limit?: number
    gas_type?: string
    passed?: boolean
    start_date?: string
    end_date?: string
}): Promise<PersonalSessionsResponse> {
    const params = new URLSearchParams()

    if (filters?.page) params.append('page', filters.page.toString())
    if (filters?.limit) params.append('limit', filters.limit.toString())
    if (filters?.gas_type) params.append('gas_type', filters.gas_type)
    if (filters?.passed !== undefined) params.append('passed', filters.passed.toString())
    if (filters?.start_date) params.append('start_date', filters.start_date)
    if (filters?.end_date) params.append('end_date', filters.end_date)

    const queryString = params.toString()
    const url = `${API_BASE_URL}/analytics/personal/sessions${queryString ? `?${queryString}` : ''}`

    return authenticatedFetch(url)
}

/**
 * Get performance trend data
 */
export async function getPerformanceTrend(period: 'week' | 'month' | 'quarter' = 'week'): Promise<PerformanceTrendResponse> {
    return authenticatedFetch(`${API_BASE_URL}/analytics/personal/performance-trend?period=${period}`)
}

/**
 * Get AI-generated performance reports
 */
export async function getPersonalReports(): Promise<PersonalReportsResponse> {
    return authenticatedFetch(`${API_BASE_URL}/analytics/personal/reports`)
}
