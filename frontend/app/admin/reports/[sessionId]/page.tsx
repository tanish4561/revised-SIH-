"use client"

import { DashboardNavbar } from "@/components/dashboard-navbar"
import { ZoneDemarcation } from "@/components/zone-demarcation"
import { TriageChain } from "@/components/triage-chain"
import { PersonalZonePrecisionChart } from "@/components/personel-zone-precision-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Calendar, User, CheckCircle2, XCircle, Download, Activity, FileText, Loader2, Brain } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSessionDetail, generateTraineeSessionReport, downloadPDF } from "@/lib/api/reports"
import { SessionDetailResponse } from "@/lib/api/types"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [data, setData] = useState<SessionDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [generatingAIReport, setGeneratingAIReport] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await getSessionDetail(sessionId)
        setData(result)
      } catch (error) {
        console.error("Error fetching session detail:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [sessionId])

  const handleDownloadTraineeReport = async (traineeName: string) => {
    try {
      setGeneratingReport(traineeName)
      const blob = await generateTraineeSessionReport(sessionId, traineeName)
      const filename = `session_${sessionId}_${traineeName.replace(/\s+/g, '_')}_report.pdf`
      downloadPDF(blob, filename)
    } catch (error) {
      console.error("Error generating trainee report:", error)
      alert(`Failed to generate report for ${traineeName}. Please try again.`)
    } finally {
      setGeneratingReport(null)
    }
  }

  const handleGenerateAIReport = async () => {
    try {
      setGeneratingAIReport(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/analytics/generate-report/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to generate AI report')
      }

      const result = await response.json()
      alert(`AI report generated successfully for ${result.users_affected} user(s)!`)

      // Refresh the page data to show the new AI report
      const updatedData = await getSessionDetail(sessionId)
      setData(updatedData)
    } catch (error) {
      console.error("Error generating AI report:", error)
      alert('Failed to generate AI report. Please try again.')
    } finally {
      setGeneratingAIReport(false)
    }
  }

  // Parse trainee names from comma-separated string
  const getTraineeNames = (): string[] => {
    if (!data?.metadata?.trainee_name) return []
    return data.metadata.trainee_name.split(',').map(name => name.trim()).filter(name => name.length > 0)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="admin" />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <Activity className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading session details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNavbar userType="admin" />
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested session could not be loaded.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const getTimeColor = (timeStr: string): string => {
    const [mins] = timeStr.split(":").map(Number)
    if (mins < 15) return "text-green-500"
    return "text-red-500"
  }

  const traineeNames = getTraineeNames()

  return (
    <div className="min-h-screen bg-background">
      <DashboardNavbar userType="admin" />

      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Reports
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Session Report</h1>
              <p className="text-muted-foreground mt-2">Detailed performance analysis</p>
            </div>
            <Button
              variant="default"
              onClick={handleGenerateAIReport}
              disabled={generatingAIReport}
            >
              {generatingAIReport ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating AI Report...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Report
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Header Card - Session Metadata */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">{data.metadata.session_id}</h2>
                  <Badge
                    variant={data.metadata.result === "PASSED" ? "default" : "destructive"}
                    className="text-sm px-3 py-1"
                  >
                    {data.metadata.result === "PASSED" ? (
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-1" />
                    )}
                    {data.metadata.result}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{data.metadata.trainee_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{data.metadata.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span className={`font-bold text-lg ${getTimeColor(data.metrics.time_taken)}`}>
                      {data.metrics.time_taken}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {data.metrics.time_taken.split(":")[0] < "15" ? "(Under 15 min)" : "(Over 15 min)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Individual Trainee Reports Section */}
        {traineeNames.length > 0 && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Individual Trainee Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate performance reports for each trainee in this session.
              </p>
              <div className="flex flex-wrap gap-3">
                {traineeNames.map((name) => (
                  <Button
                    key={name}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadTraineeReport(name)}
                    disabled={generatingReport !== null}
                    className="flex items-center gap-2"
                  >
                    {generatingReport === name ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download Report: {name}
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Zone Demarcation Visualization */}
        <ZoneDemarcation cones={data.metrics.cones} gasType={data.gas_type} />

        {/* Zone Demarcation Precision Distribution - Individual */}
        <PersonalZonePrecisionChart cones={data.metrics.cones} />

        {/* Triage Chain */}
        <TriageChain triage={data.metrics.triage} />

        {/* Failures (if any) - Flattened display */}
        {data.metrics.failures && data.metrics.failures.length > 0 && (
          <Card className="bg-card border-border border-red-500/30">
            <CardHeader>
              <CardTitle className="text-lg text-red-600">Mission Failures</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {data.metrics.failures.map((failure, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{failure}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Per-User Mistakes (New Format) */}
        {data.metrics.mistakes && Array.isArray(data.metrics.mistakes) && data.metrics.mistakes.length > 0 &&
          typeof data.metrics.mistakes[0] === 'object' && 'Mistakes' in data.metrics.mistakes[0] && (
            <Card className="bg-card border-border border-orange-500/30">
              <CardHeader>
                <CardTitle className="text-lg text-orange-600">Mistakes by User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.metrics.mistakes.map((entry: any, index: number) => (
                    entry.Mistakes && entry.Mistakes.length > 0 && (
                      <div key={index} className="border-l-2 border-orange-500 pl-4">
                        <p className="font-semibold text-sm mb-2">
                          User {entry.user_id} {data.metadata.users && data.metadata.users[index] && `(${data.metadata.users[index]})`}
                        </p>
                        <ul className="space-y-1">
                          {entry.Mistakes.map((mistake: string, mIndex: number) => (
                            <li key={mIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <XCircle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                              <span>{mistake.replace(/_/g, ' ')}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        {/* AI Analysis Report - Multi-User Support */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">AI Performance Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {data.ai_reports && data.ai_reports.length > 0 ? (
              <div className="space-y-8">
                {data.ai_reports.map((report, index) => (
                  <div key={report.user_id} className={index > 0 ? "border-t border-border pt-6" : ""}>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      {report.username}
                    </h3>
                    <div className="markdown-content space-y-4 text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-5 mb-3" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-lg font-semibold mt-4 mb-2" {...props} />,
                          p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 mb-3" {...props} />,
                          li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                          em: ({ node, ...props }) => <em className="italic" {...props} />,
                          hr: ({ node, ...props }) => <hr className="my-4 border-border" {...props} />,
                          code: ({ node, inline, ...props }: any) =>
                            inline ? (
                              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                            ) : (
                              <code className="block bg-muted p-3 rounded-lg text-xs font-mono overflow-x-auto" {...props} />
                            ),
                        }}
                      >
                        {report.report_content}
                      </ReactMarkdown>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="mb-2">No AI reports available for this session.</p>
                <p className="text-sm">Click "Generate AI Report" above to create performance analysis for all users.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
