"use client"

import { useState, useEffect } from "react"
import { DashboardNavbar } from "@/components/dashboard-navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Hash, Shield, User, Award, Phone, Mail, MapPin, Target, Edit2, Save, X, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth-context"
import { updateProfile } from "@/lib/api/auth"

export default function PersonnelProfilePage() {
  const { user, refreshUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    rank: user?.rank || 'Trainee',
    department: user?.department || 'Chemical Disaster Management',
    experience_years: user?.experience_years || 0,
    unit: user?.unit || '',
    certifications: user?.certifications || []
  })

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || '',
        rank: user.rank || 'Trainee',
        department: user.department || 'Chemical Disaster Management',
        experience_years: user.experience_years || 0,
        unit: user.unit || '',
        certifications: user.certifications || []
      })
    }
  }, [user])

  // Check if profile is incomplete
  const isProfileIncomplete = !user?.phone || !user?.unit || user?.certifications?.length === 0

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await updateProfile(formData)
      await refreshUser()
      setIsEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        phone: user.phone || '',
        rank: user.rank || 'Trainee',
        department: user.department || 'Chemical Disaster Management',
        experience_years: user.experience_years || 0,
        unit: user.unit || '',
        certifications: user.certifications || []
      })
    }
    setIsEditing(false)
    setError(null)
  }

  const handleAddCertification = () => {
    const cert = prompt('Enter certification name:')
    if (cert && cert.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert.trim()]
      }))
    }
  }

  const handleRemoveCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="personnel" />

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold">Personal Details</h1>
                <p className="text-muted-foreground">Review and update your personnel profile</p>
              </div>
            </div>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile Completion Alert */}
        {isProfileIncomplete && !isEditing && (
          <Card className="mb-6 border-yellow-500/50 bg-yellow-500/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-yellow-500 mb-2">Complete Your Profile</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please fill in your phone number, unit, and certifications to complete your profile.
                  </p>
                  <Button size="sm" onClick={() => setIsEditing(true)} variant="outline" className="border-yellow-500/50">
                    Complete Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Message */}
        {success && (
          <Card className="mb-6 border-green-500/50 bg-green-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-green-500">
                <CheckCircle2 className="w-5 h-5" />
                <p className="font-semibold">Profile updated successfully!</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p className="font-semibold">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-8 space-y-10">
            {/* Header Section */}
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-primary">{user?.username || 'Personnel'}</h2>
              <p className="text-lg text-muted-foreground">{user?.email || 'No email'}</p>
              {user?.is_active && (
                <div className="flex items-center justify-center gap-2 text-green-500 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Active Personnel</span>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Non-editable fields */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Hash className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Personnel ID</span>
                </div>
                <span className="font-bold text-foreground">NDRF-{user?.id?.toString().padStart(5, '0')}</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Email</span>
                </div>
                <span className="font-bold text-foreground">{user?.email || 'Not set'}</span>
              </div>

              {/* Editable fields */}
              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Phone</span>
                </div>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-40 text-right"
                  />
                ) : (
                  <span className="font-bold text-foreground">{user?.phone || 'Not set'}</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Rank</span>
                </div>
                {isEditing ? (
                  <Input
                    value={formData.rank}
                    onChange={(e) => setFormData(prev => ({ ...prev, rank: e.target.value }))}
                    className="w-40 text-right"
                  />
                ) : (
                  <span className="font-bold text-foreground">{user?.rank}</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Department</span>
                </div>
                {isEditing ? (
                  <Input
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-64 text-right"
                  />
                ) : (
                  <span className="font-bold text-foreground">{user?.department}</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Experience</span>
                </div>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) => setFormData(prev => ({ ...prev, experience_years: parseInt(e.target.value) || 0 }))}
                    className="w-24 text-right"
                  />
                ) : (
                  <span className="font-bold text-foreground">{user?.experience_years} Years</span>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-border md:col-span-2">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <span className="font-medium">Unit</span>
                </div>
                {isEditing ? (
                  <Input
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g., Unit 07 — CBRN Response"
                    className="w-96 text-right"
                  />
                ) : (
                  <span className="font-bold text-foreground">{user?.unit || 'Not assigned'}</span>
                )}
              </div>
            </div>

            {/* Certifications */}
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Certifications</h3>
                {isEditing && (
                  <Button size="sm" onClick={handleAddCertification} variant="outline">
                    Add Certification
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {formData.certifications.length > 0 ? (
                  formData.certifications.map((cert, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="px-4 py-2 text-sm border-primary/50 text-primary hover:bg-primary/10 transition-colors relative group"
                    >
                      {cert}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveCertification(index)}
                          className="ml-2 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No certifications added yet</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={isSaving} className="flex-1 gap-2">
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button onClick={handleCancel} variant="outline" disabled={isSaving} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
