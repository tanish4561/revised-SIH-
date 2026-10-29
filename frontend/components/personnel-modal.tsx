"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User } from "@/lib/api/types"
import { useState, useEffect } from "react"

interface PersonnelModalProps {
  open: boolean
  onClose: () => void
  onSave: (userData: Partial<User>) => Promise<void>
  personnel?: User | null
  mode: "add" | "edit"
}

export function PersonnelModal({ open, onClose, onSave, personnel, mode }: PersonnelModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    rank: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "TRAINING",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (personnel && mode === "edit") {
      setFormData({
        name: personnel.name,
        rank: personnel.rank,
        status: personnel.status,
      })
    } else {
      setFormData({
        name: "",
        rank: "",
        status: "ACTIVE",
      })
    }
  }, [personnel, mode, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Failed to save personnel:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Personnel" : "Edit Personnel"}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Enter the details of the new NDRF personnel member."
              : "Update the personnel information below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Sgt. Rajesh Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rank">Rank</Label>
            <Select value={formData.rank} onValueChange={(value) => setFormData({ ...formData, rank: value })}>
              <SelectTrigger id="rank">
                <SelectValue placeholder="Select rank" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Squad Leader">Squad Leader</SelectItem>
                <SelectItem value="Rescuer">Rescuer</SelectItem>
                <SelectItem value="Lieutenant">Lieutenant</SelectItem>
                <SelectItem value="Sergeant">Sergeant</SelectItem>
                <SelectItem value="Corporal">Corporal</SelectItem>
                <SelectItem value="Naik">Naik</SelectItem>
                <SelectItem value="Havildar">Havildar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: "ACTIVE" | "INACTIVE" | "TRAINING") => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="TRAINING">Training</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "add" ? "Add Personnel" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
