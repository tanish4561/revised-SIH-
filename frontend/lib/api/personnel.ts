import { PersonnelResponse, User } from "./types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:5000"

/**
 * Fetches personnel list with pagination and optional search
 * GET /api/personnel?page=1&limit=20&search=query
 */
export async function getPersonnel(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<PersonnelResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search && search.trim()) {
      params.append("search", search)
    }

    const response = await fetch(`${API_BASE_URL}/users/?${params.toString()}`, {
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
    console.error("Failed to fetch personnel:", error)

    // Mock data for development
    return {
      total_count: 45,
      users: [
        {
          user_id: "NDRF_001",
          name: "Sgt. Rajesh Kumar",
          rank: "Squad Leader",
          total_sessions: 12,
          last_trained_date: "2024-12-08",
          status: "ACTIVE",
        },
        {
          user_id: "NDRF_002",
          name: "Cpl. Priya Singh",
          rank: "Rescuer",
          total_sessions: 8,
          last_trained_date: "2024-12-07",
          status: "ACTIVE",
        },
        {
          user_id: "NDRF_003",
          name: "Lt. Amit Patel",
          rank: "Squad Leader",
          total_sessions: 15,
          last_trained_date: "2024-12-09",
          status: "TRAINING",
        },
        {
          user_id: "NDRF_004",
          name: "Naik Deepak Sharma",
          rank: "Rescuer",
          total_sessions: 6,
          last_trained_date: "2024-12-05",
          status: "ACTIVE",
        },
        {
          user_id: "NDRF_005",
          name: "Havildar Rajkumar Roy",
          rank: "Squad Leader",
          total_sessions: 10,
          last_trained_date: "2024-11-30",
          status: "INACTIVE",
        },
      ],
    }
  }
}

/**
 * Creates a new personnel record
 * POST /api/personnel
 */
export async function createPersonnel(userData: Omit<User, "user_id">): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to create personnel:", error)
    throw error
  }
}

/**
 * Updates an existing personnel record
 * PUT /api/personnel/:id
 */
export async function updatePersonnel(userId: string, userData: Partial<User>): Promise<User> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Failed to update personnel:", error)
    throw error
  }
}

/**
 * Deletes a personnel record
 * DELETE /api/personnel/:id
 */
export async function deletePersonnel(userId: string): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
  } catch (error) {
    console.error("Failed to delete personnel:", error)
    throw error
  }
}
