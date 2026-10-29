"use client";

import { DashboardNavbar } from "@/components/dashboard-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Calendar,
  Activity,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getReports } from "@/lib/api/reports";
import { SessionListItem } from "@/lib/api/types";

function AdminReportsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PASSED" | "FAILED">(
    "ALL"
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const pageSize = 10;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get user filter from URL params (from Personnel page "View History")
  const userFilter = searchParams.get("user");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch reports data
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getReports({
        page: currentPage,
        limit: pageSize,
        search: debouncedSearch,
        user: userFilter || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setSessions(response.sessions);
      setTotalCount(response.total_count);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    debouncedSearch,
    userFilter,
    startDate,
    endDate,
    statusFilter,
  ]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleViewSession = (sessionId: string) => {
    router.push(`/admin/reports/${sessionId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASSED":
        return "bg-green-500/20 text-green-600";
      case "FAILED":
        return "bg-red-500/20 text-red-600";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTimeColor = (timeStr: string): string => {
    const [mins] = timeStr.split(":").map(Number);
    if (mins < 15) return "text-green-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="admin" />

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Training Session Reports</h1>
              <p className="text-muted-foreground mt-2">
                {userFilter
                  ? `Viewing reports for personnel: ${userFilter}`
                  : "View and analyze training sessions"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{totalCount}</p>
              <p className="text-xs text-muted-foreground mt-1">all sessions</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Passed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-500">
                {sessions.filter((s) => s.result === "PASSED").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-500">
                {sessions.filter((s) => s.result === "FAILED").length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pass Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {sessions.length > 0
                  ? Math.round(
                      (sessions.filter((s) => s.result === "PASSED").length /
                        sessions.length) *
                        100
                    )
                  : 0}
                %
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <CardTitle>Filters</CardTitle>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border-border"
                />
              </div>
              <Select
                value={statusFilter}
                onValueChange={(v: any) => setStatusFilter(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PASSED">Passed</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                placeholder="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-border"
              />
              <Input
                type="date"
                placeholder="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
          </CardHeader>
        </Card>

        {/* Recent Reports */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Session Reports</CardTitle>
            <CardDescription>
              Showing {sessions.length} of {totalCount} sessions
            </CardDescription>
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
                        <th className="text-left py-3 px-4 font-semibold">
                          Session ID
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Trainee Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold">
                          Date
                        </th>
                        <th className="text-center py-3 px-4 font-semibold">
                          Duration
                        </th>
                        <th className="text-center py-3 px-4 font-semibold">
                          Result
                        </th>
                        <th className="text-right py-3 px-4 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr
                          key={session.session_id}
                          className="border-b border-border hover:bg-muted/50 transition"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <p className="font-mono text-xs">
                                {session.session_id}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium">
                            {session.trainee_name}
                          </td>
                          <td className="py-4 px-4 text-muted-foreground">
                            <div className="flex items-center gap-2 text-xs">
                              <Calendar className="w-3 h-3" />
                              {session.date}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`font-bold ${getTimeColor(
                                session.time_taken
                              )}`}
                            >
                              {session.time_taken}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                session.result
                              )}`}
                            >
                              {session.result}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleViewSession(session.session_id)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
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
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
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
    </div>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Activity className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminReportsContent />
    </Suspense>
  );
}
