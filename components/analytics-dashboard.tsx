"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"

interface AnalyticsDashboardProps {
  trafficData: any[]
  historicalData: any[]
  location: { lat: number; lng: number } | null
  socialReports?: any[]
}

export default function AnalyticsDashboard({
  trafficData,
  historicalData,
  location,
  socialReports = [],
}: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (trafficData.length > 0 || historicalData.length > 0) {
      processAnalytics()
    }
  }, [trafficData, historicalData])

  const processAnalytics = () => {
    setIsProcessing(true)

    // Use Background Tasks API for analytics processing
    const processChunk = (deadline: IdleDeadline) => {
      while (deadline.timeRemaining() > 0) {
        const results = {
          currentStats: calculateCurrentStats(),
          trends: calculateTrends(),
          patterns: identifyPatterns(),
          efficiency: calculateEfficiency(),
          predictions: generateInsights(),
        }

        setAnalytics(results)
        setIsProcessing(false)
        return
      }

      requestIdleCallback(processChunk)
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(processChunk)
    } else {
      setTimeout(() => processChunk({ timeRemaining: () => 50, didTimeout: false }), 0)
    }
  }

  const calculateCurrentStats = () => {
    if (trafficData.length === 0) return null

    const avgCongestion = trafficData.reduce((sum, p) => sum + p.congestion, 0) / trafficData.length
    const avgSpeed = trafficData.reduce((sum, p) => sum + p.speed, 0) / trafficData.length
    const totalVolume = trafficData.reduce((sum, p) => sum + (p.volume || 0), 0)
    const incidents = trafficData.filter((p) => p.incidents).length
    const socialReportsCount = socialReports.length

    return {
      avgCongestion: Math.round(avgCongestion * 100),
      avgSpeed: Math.round(avgSpeed),
      totalVolume,
      incidents,
      efficiency: Math.round((1 - avgCongestion) * 100),
      socialReportsCount,
    }
  }

  const calculateTrends = () => {
    if (historicalData.length < 2) return null

    const recent = historicalData.slice(-10)
    const older = historicalData.slice(-20, -10)

    if (older.length === 0) return null

    const recentAvg = recent.reduce((sum, d) => sum + d.avgCongestion, 0) / recent.length
    const olderAvg = older.reduce((sum, d) => sum + d.avgCongestion, 0) / older.length

    const trend = recentAvg - olderAvg
    const trendPercentage = Math.round((trend / olderAvg) * 100)

    return {
      direction: trend > 0 ? "increasing" : "decreasing",
      percentage: Math.abs(trendPercentage),
      isImproving: trend < 0,
    }
  }

  const identifyPatterns = () => {
    const hour = new Date().getHours()
    const isRushHour = (hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)
    const isWeekend = [0, 6].includes(new Date().getDay())

    return {
      currentPeriod: isRushHour ? "Rush Hour" : isWeekend ? "Weekend" : "Regular Hours",
      peakHours: [8, 9, 17, 18, 19],
      quietHours: [2, 3, 4, 5, 6],
      weekendPattern: "Lower traffic volume",
    }
  }

  const calculateEfficiency = () => {
    if (trafficData.length === 0) return null

    const highwayPoints = trafficData.filter((p) => p.roadType === "highway")
    const arterialPoints = trafficData.filter((p) => p.roadType === "arterial")
    const localPoints = trafficData.filter((p) => p.roadType === "local")

    return {
      highway:
        highwayPoints.length > 0
          ? Math.round((1 - highwayPoints.reduce((sum, p) => sum + p.congestion, 0) / highwayPoints.length) * 100)
          : 0,
      arterial:
        arterialPoints.length > 0
          ? Math.round((1 - arterialPoints.reduce((sum, p) => sum + p.congestion, 0) / arterialPoints.length) * 100)
          : 0,
      local:
        localPoints.length > 0
          ? Math.round((1 - localPoints.reduce((sum, p) => sum + p.congestion, 0) / localPoints.length) * 100)
          : 0,
    }
  }

  const generateInsights = () => {
    const insights = []

    if (analytics?.currentStats) {
      if (analytics.currentStats.avgCongestion > 70) {
        insights.push({
          type: "warning",
          message: "High congestion detected - consider alternative routes",
          icon: "⚠️",
        })
      }

      if (analytics.currentStats.incidents > 0) {
        insights.push({
          type: "alert",
          message: `${analytics.currentStats.incidents} traffic incidents reported`,
          icon: "🚨",
        })
      }

      if (analytics.currentStats.efficiency > 80) {
        insights.push({
          type: "success",
          message: "Traffic flow is optimal in your area",
          icon: "✅",
        })
      }
    }

    return insights
  }

  if (isProcessing) {
    return (
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <Activity className="h-8 w-8 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Processing analytics data...</p>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Waiting for traffic data...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Statistics */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Real-time Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.currentStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{analytics.currentStats.avgCongestion}%</div>
                <div className="text-sm text-blue-700">Avg Congestion</div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{analytics.currentStats.avgSpeed}</div>
                <div className="text-sm text-green-700">Avg Speed (km/h)</div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{analytics.currentStats.totalVolume}</div>
                <div className="text-sm text-purple-700">Total Volume</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{analytics.currentStats.incidents}</div>
                <div className="text-sm text-orange-700">Active Incidents</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trends and Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Traffic Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.trends ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Congestion Trend</span>
                  <Badge variant={analytics.trends.isImproving ? "secondary" : "destructive"}>
                    {analytics.trends.direction} {analytics.trends.percentage}%
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">
                  Traffic is {analytics.trends.isImproving ? "improving" : "worsening"} compared to recent patterns
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Collecting trend data...</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-600" />
              Traffic Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.patterns && (
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Current Period:</span>
                  <Badge variant="outline" className="ml-2">
                    {analytics.patterns.currentPeriod}
                  </Badge>
                </div>

                <div className="text-sm space-y-1">
                  <p>
                    <strong>Peak Hours:</strong> {analytics.patterns.peakHours.join(", ")}:00
                  </p>
                  <p>
                    <strong>Quiet Hours:</strong> {analytics.patterns.quietHours.join(", ")}:00
                  </p>
                  <p>
                    <strong>Weekend:</strong> {analytics.patterns.weekendPattern}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Road Efficiency */}
      {analytics.efficiency && (
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Road Network Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-semibold">{analytics.efficiency.highway}%</div>
                <div className="text-sm text-muted-foreground">Highways</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${analytics.efficiency.highway}%` }} />
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">{analytics.efficiency.arterial}%</div>
                <div className="text-sm text-muted-foreground">Arterial Roads</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${analytics.efficiency.arterial}%` }}
                  />
                </div>
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold">{analytics.efficiency.local}%</div>
                <div className="text-sm text-muted-foreground">Local Streets</div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: `${analytics.efficiency.local}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {analytics.predictions && analytics.predictions.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.predictions.map((insight: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/60 rounded-lg">
                  <span className="text-lg">{insight.icon}</span>
                  <span className="text-sm">{insight.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
