"use client"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { PersonnelModal } from "@/components/personnel-modal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit2, Trash2, FileText, Activity, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { getPersonnel, createPersonnel, updatePersonnel, deletePersonnel } from "@/lib/api/personnel"
import { User } from "@/lib/api/types"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function PersonnelManagementPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [personnel, setPersonnel] = useState<User[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedPersonnel, setSelectedPersonnel] = useState<User | null>(null)

  const pageSize = 10
  const totalPages = Math.ceil(totalCount / pageSize)

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setCurrentPage(1) // Reset to first page on search
    }, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch personnel data
  const fetchPersonnel = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await getPersonnel(currentPage, pageSize, debouncedSearch)
      setPersonnel(response.users)
      setTotalCount(response.total_count)
    } catch (error) {
      console.error("Failed to fetch personnel:", error)
      toast.error("Failed to load personnel data")
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearch])

  useEffect(() => {
    fetchPersonnel()
  }, [fetchPersonnel])

  const handleAddPersonnel = () => {
    setModalMode("add")
    setSelectedPersonnel(null)
    setModalOpen(true)
  }

  const handleEditPersonnel = (person: User) => {
    setModalMode("edit")
    setSelectedPersonnel(person)
    setModalOpen(true)
  }

  const handleSavePersonnel = async (userData: Partial<User>) => {
    try {
      if (modalMode === "add") {
        await createPersonnel(userData as Omit<User, "user_id">)
        toast.success("Personnel added successfully")
      } else if (selectedPersonnel) {
        await updatePersonnel(selectedPersonnel.user_id, userData)
        toast.success("Personnel updated successfully")
      }
      fetchPersonnel()
    } catch (error) {
      toast.error(`Failed to ${modalMode} personnel`)
      throw error
    }
  }

  const handleDeletePersonnel = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return
    try {
      await deletePersonnel(userId)
      toast.success("Personnel deleted successfully")
      fetchPersonnel()
    } catch (error) {
      toast.error("Failed to delete personnel")
    }
  }

  const handleViewHistory = (userId: string) => {
    router.push(`/admin/reports?user=${userId}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500/20 text-green-600"
      case "TRAINING":
        return "bg-yellow-500/20 text-yellow-600"
      case "INACTIVE":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="admin" />

      <div className="border-b border-border/50 bg-gradient-to-r from-card to-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-balance text-primary">Personnel Management</h1>
              <p className="text-muted-foreground mt-2 text-sm sm:text-base">Monitor and manage NDRF personnel</p>
            </div>
            <Button className="bg-primary hover:bg-primary/90" onClick={handleAddPersonnel}>
              <Plus className="w-4 h-4 mr-2" />
              Add Personnel
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Personnel Records with Search */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Personnel Records</CardTitle>
                <CardDescription>
                  Showing {personnel.length} of {totalCount} personnel
                </CardDescription>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, rank, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background/50 border-border focus:border-primary"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Activity className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Rank</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Total Sessions</th>
                        <th className="text-center py-3 px-4 font-semibold text-muted-foreground">Status</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Last Trained</th>
                        <th className="text-right py-3 px-4 font-semibold text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {personnel.map((p) => (
                        <tr key={p.user_id} className="border-b border-border hover:bg-muted/50 transition">
                          <td className="py-4 px-4 text-muted-foreground text-xs font-mono">{p.user_id}</td>
                          <td className="py-4 px-4">
                            <p className="font-medium">{p.name}</p>
                          </td>
                          <td className="py-4 px-4 text-muted-foreground text-sm">{p.rank}</td>
                          <td className="py-4 px-4 text-center font-medium text-primary">{p.total_sessions}</td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(p.status)}`}
                            >
                              {p.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right text-muted-foreground text-xs">{p.last_trained_date}</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewHistory(p.user_id)}
                                title="View History"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleEditPersonnel(p)} title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePersonnel(p.user_id, p.name)}
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <PersonnelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSavePersonnel}
        personnel={selectedPersonnel}
        mode={modalMode}
      />
    </div>
  )
}
