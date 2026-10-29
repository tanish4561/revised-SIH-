// API client for session management

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface CreateSessionRequest {
    gas_type: string
    num_users: number
    user_ids: number[]
}

export interface CreateSessionResponse {
    session_id: number
    config: {
        gas_type: string
        num_users: number
        user_ids: number[]
    }
    created_at: string
}

export interface UserListItem {
    id: number
    username: string
    rank: string
    role: string
}

export async function createSession(data: CreateSessionRequest): Promise<CreateSessionResponse> {
    const response = await fetch(`${API_BASE}/game/sessions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create session')
    }

    return response.json()
}

export async function getAllUsers(): Promise<UserListItem[]> {
    try {
        // Add trailing slash to avoid 308 redirect from Flask
        const response = await fetch(`${API_BASE}/users/`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })

        if (!response.ok) {
            console.error('Failed to fetch users:', response.status)
            return []
        }

        const data = await response.json()

        // Backend returns: { total_count, users: [{ user_id, name, rank, ... }] }
        // We need to map to: { id, username, rank, role }
        if (data.users && Array.isArray(data.users)) {
            return data.users.map((u: any) => ({
                id: parseInt(u.user_id),
                username: u.name,
                rank: u.rank,
                role: u.rank.toLowerCase() // Use rank as role
            }))
        }

        return []
    } catch (error) {
        console.error('Error fetching users:', error)
        return []
    }
}
