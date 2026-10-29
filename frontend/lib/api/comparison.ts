/**
 * API client for personnel comparison data
 */

import { getAuthToken } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface PersonnelComparison {
    id: string
    name: string
    rank: string
    zone_precision_score: number
    triage_accuracy_score: number
    speed_score: number
    protocol_compliance_score: number
    decision_making_score: number
    overall_score: number
    total_sessions: number
    passed_sessions: number
    pass_rate: number
    avg_completion_time: number
    avg_ppm_deviation: number
    perfect_triage_count: number
    percentile_zone_precision: number
    percentile_triage: number
    percentile_speed: number
    percentile_overall: number
}

export interface ComparisonResponse {
    personnel: PersonnelComparison[]
    team_average: PersonnelComparison | null
    total_count: number
}

/**
 * Get personnel comparison data
 */
export async function getPersonnelComparison(): Promise<ComparisonResponse> {
    const token = getAuthToken()

    if (!token) {
        throw new Error('Authentication required')
    }

    const response = await fetch(`${API_BASE_URL}/api/comparison/personnel`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch comparison data' }))
        throw new Error(error.error || 'Failed to fetch comparison data')
    }

    return response.json()
}
