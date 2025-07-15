"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MessageSquare, ThumbsUp, AlertTriangle, CheckCircle, MapPin, Send, Heart } from "lucide-react"

interface SocialTrafficReportsProps {
  reports: any[]
  onReportsUpdate: (reports: any[]) => void
  userLocation: { lat: number; lng: number } | null
}

export default function SocialTrafficReports({ reports, onReportsUpdate, userLocation }: SocialTrafficReportsProps) {
  const [newReport, setNewReport] = useState("")
  const [selectedType, setSelectedType] = useState("traffic")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const reportTypes = [
    { id: "accident", label: "Accident", icon: "🚗", color: "bg-red-100 text-red-800" },
    { id: "construction", label: "Construction", icon: "🚧", color: "bg-orange-100 text-orange-800" },
    { id: "heavy_traffic", label: "Heavy Traffic", icon: "🚦", color: "bg-yellow-100 text-yellow-800" },
    { id: "clear_road", label: "Clear Road", icon: "✅", color: "bg-green-100 text-green-800" },
    { id: "police", label: "Police", icon: "👮", color: "bg-blue-100 text-blue-800" },
    { id: "weather", label: "Weather", icon: "🌧️", color: "bg-gray-100 text-gray-800" },
  ]

  const submitReport = async () => {
    if (!newReport.trim() || !userLocation) return

    setIsSubmitting(true)

    const report = {
      id: Date.now(),
      user: "You",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
      location: userLocation,
      type: selectedType,
      message: newReport,
      timestamp: Date.now(),
      upvotes: 0,
      verified: false,
      severity: Math.random(),
      isOwn: true,
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onReportsUpdate([report, ...reports])
    setNewReport("")
    setIsSubmitting(false)

    // Success feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  const upvoteReport = (reportId: number) => {
    const updatedReports = reports.map((report) =>
      report.id === reportId ? { ...report, upvotes: report.upvotes + 1, hasUpvoted: true } : report,
    )
    onReportsUpdate(updatedReports)

    // Haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([50])
    }
  }

  const getReportIcon = (type: string) => {
    const reportType = reportTypes.find((t) => t.id === type)
    return reportType?.icon || "📍"
  }

  const getReportColor = (type: string) => {
    const reportType = reportTypes.find((t) => t.id === type)
    return reportType?.color || "bg-gray-100 text-gray-800"
  }

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="space-y-6">
      {/* Submit New Report */}
      <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Report Traffic Conditions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Report Type Selection */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {reportTypes.map((type) => (
              <Button
                key={type.id}
                variant={selectedType === type.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.id)}
                className="flex flex-col items-center gap-1 h-auto py-3 bg-white/50 backdrop-blur-sm hover:bg-white/70"
              >
                <span className="text-lg">{type.icon}</span>
                <span className="text-xs">{type.label}</span>
              </Button>
            ))}
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe the traffic condition..."
              value={newReport}
              onChange={(e) => setNewReport(e.target.value)}
              className="bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white/70"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {userLocation ? "📍 Using current location" : "📍 Location required"}
              </span>
              <Button
                onClick={submitReport}
                disabled={!newReport.trim() || !userLocation || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isSubmitting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Reports Feed */}
      <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            Live Traffic Reports
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              {reports.length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No traffic reports yet. Be the first to report!</p>
              </div>
            ) : (
              reports.map((report) => (
                <Card
                  key={report.id}
                  className={`bg-white/50 backdrop-blur-sm border-white/20 hover:bg-white/70 transition-all duration-300 ${
                    report.isOwn ? "ring-2 ring-blue-200" : ""
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={report.avatar || "/placeholder.svg"} />
                        <AvatarFallback>{report.user[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{report.user}</span>
                          {report.verified && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className={`text-xs ${getReportColor(report.type)}`}>
                            {getReportIcon(report.type)} {reportTypes.find((t) => t.id === report.type)?.label}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">{getTimeAgo(report.timestamp)}</span>
                        </div>

                        <p className="text-sm text-gray-700">{report.message}</p>

                        <div className="flex items-center gap-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => upvoteReport(report.id)}
                            disabled={report.hasUpvoted}
                            className="text-xs hover:bg-white/50"
                          >
                            <ThumbsUp
                              className={`h-3 w-3 mr-1 ${report.hasUpvoted ? "fill-current text-blue-600" : ""}`}
                            />
                            {report.upvotes}
                          </Button>

                          <Button variant="ghost" size="sm" className="text-xs hover:bg-white/50">
                            <MapPin className="h-3 w-3 mr-1" />
                            Show on Map
                          </Button>

                          {report.severity > 0.7 && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              High Priority
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Community Stats */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-xl border-0 shadow-xl ring-1 ring-white/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Community Impact
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <div className="text-sm text-muted-foreground">Total Reports</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{reports.filter((r) => r.verified).length}</div>
              <div className="text-sm text-muted-foreground">Verified Reports</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{reports.reduce((sum, r) => sum + r.upvotes, 0)}</div>
              <div className="text-sm text-muted-foreground">Community Votes</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((reports.filter((r) => r.verified).length / Math.max(reports.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
