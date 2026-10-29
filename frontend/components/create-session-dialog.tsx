"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Plus, Copy, CheckCircle2, Users, Beaker } from "lucide-react"
import { createSession, getAllUsers, type UserListItem } from "@/lib/api/sessions"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export function CreateSessionDialog() {
    const [open, setOpen] = useState(false)
    const [gasType, setGasType] = useState("chlorine")
    const [numUsers, setNumUsers] = useState(2)
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([])
    const [users, setUsers] = useState<UserListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [createdSession, setCreatedSession] = useState<{
        session_id: number
        user_ids: number[]
        gas_type: string
    } | null>(null)
    const [copiedSessionId, setCopiedSessionId] = useState(false)
    const [copiedUserIds, setCopiedUserIds] = useState(false)

    // Fetch users when dialog opens
    useEffect(() => {
        if (open && users.length === 0) {
            getAllUsers()
                .then(setUsers)
                .catch(console.error)
        }
    }, [open])

    const handleCreateSession = async () => {
        if (selectedUserIds.length !== numUsers) {
            alert(`Please select exactly ${numUsers} users`)
            return
        }

        setIsLoading(true)
        try {
            const response = await createSession({
                gas_type: gasType,
                num_users: numUsers,
                user_ids: selectedUserIds,
            })

            setCreatedSession({
                session_id: response.session_id,
                user_ids: selectedUserIds,
                gas_type: gasType,
            })
        } catch (error) {
            console.error("Failed to create session:", error)
            alert("Failed to create session. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    const handleUserToggle = (userId: number) => {
        if (selectedUserIds.includes(userId)) {
            setSelectedUserIds(selectedUserIds.filter(id => id !== userId))
        } else {
            if (selectedUserIds.length < numUsers) {
                setSelectedUserIds([...selectedUserIds, userId])
            }
        }
    }

    const copyToClipboard = (text: string, type: 'session' | 'users') => {
        navigator.clipboard.writeText(text)
        if (type === 'session') {
            setCopiedSessionId(true)
            setTimeout(() => setCopiedSessionId(false), 2000)
        } else {
            setCopiedUserIds(true)
            setTimeout(() => setCopiedUserIds(false), 2000)
        }
    }

    const resetForm = () => {
        setCreatedSession(null)
        setSelectedUserIds([])
        setNumUsers(2)
        setGasType("chlorine")
        setCopiedSessionId(false)
        setCopiedUserIds(false)
    }

    const handleClose = () => {
        setOpen(false)
        setTimeout(resetForm, 300) // Reset after dialog closes
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Session
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                {!createdSession ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-primary" />
                                Create Training Session
                            </DialogTitle>
                            <DialogDescription>
                                Set up a new VR training session. The session ID and user IDs will be entered manually in the game.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            {/* Gas Type Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="gas-type">Gas Type</Label>
                                <Select value={gasType} onValueChange={setGasType}>
                                    <SelectTrigger id="gas-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="chlorine">Chlorine</SelectItem>
                                        <SelectItem value="ammonia" disabled>
                                            Ammonia (Coming Soon)
                                        </SelectItem>
                                        <SelectItem value="sulfur_dioxide" disabled>
                                            Sulfur Dioxide (Coming Soon)
                                        </SelectItem>
                                        <SelectItem value="hydrogen_sulfide" disabled>
                                            Hydrogen Sulfide (Coming Soon)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Currently showcasing Chlorine only</p>
                            </div>

                            {/* Number of Users */}
                            <div className="space-y-2">
                                <Label htmlFor="num-users">Number of Users</Label>
                                <Input
                                    id="num-users"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={numUsers}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value) || 1
                                        setNumUsers(Math.min(10, Math.max(1, val)))
                                        // Reset selection if changing number
                                        setSelectedUserIds([])
                                    }}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Select {numUsers} user{numUsers > 1 ? 's' : ''} below
                                </p>
                            </div>

                            {/* User Selection */}
                            <div className="space-y-2">
                                <Label>Select Users ({selectedUserIds.length}/{numUsers})</Label>
                                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                                    {users.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">Loading users...</p>
                                    ) : (
                                        users.map((user) => (
                                            <div
                                                key={user.id}
                                                onClick={() => handleUserToggle(user.id)}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedUserIds.includes(user.id)
                                                    ? "bg-primary/10 border-primary"
                                                    : "hover:bg-muted/50 border-border"
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedUserIds.includes(user.id)
                                                            ? "bg-primary border-primary"
                                                            : "border-muted-foreground"
                                                            }`}>
                                                            {selectedUserIds.includes(user.id) && (
                                                                <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{user.username}</p>
                                                            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline">{user.rank}</Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Create Button */}
                            <Button
                                onClick={handleCreateSession}
                                disabled={isLoading || selectedUserIds.length !== numUsers}
                                className="w-full"
                            >
                                {isLoading ? "Creating..." : "Create Session"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="w-5 h-5" />
                                Session Created Successfully
                            </DialogTitle>
                            <DialogDescription>
                                Enter these values in the VR game to start the training session
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            {/* Session ID */}
                            <Card className="p-6 bg-primary/5 border-primary/20">
                                <div className="space-y-2">
                                    <Label className="text-xs text-muted-foreground">Session ID</Label>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 text-4xl font-bold text-primary font-mono">
                                            {createdSession.session_id}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => copyToClipboard(createdSession.session_id.toString(), 'session')}
                                        >
                                            {copiedSessionId ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </Card>

                            {/* User IDs */}
                            <Card className="p-4 bg-muted/30">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-sm font-semibold flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            User IDs
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => copyToClipboard(createdSession.user_ids.join(', '), 'users')}
                                        >
                                            {copiedUserIds ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {createdSession.user_ids.map((id) => {
                                            const user = users.find(u => u.id === id)
                                            return (
                                                <Badge key={id} variant="secondary" className="text-base px-3 py-1">
                                                    {id} {user && `(${user.username})`}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </div>
                            </Card>

                            {/* Gas Type Info */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Beaker className="w-4 h-4" />
                                <span>Gas Type: <span className="font-semibold text-foreground capitalize">{createdSession.gas_type.replace('_', ' ')}</span></span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-2">
                                <Button onClick={resetForm} variant="outline" className="flex-1">
                                    Create Another Session
                                </Button>
                                <Button onClick={handleClose} className="flex-1">
                                    Done
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
