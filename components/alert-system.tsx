"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertTriangle, Info, CheckCircle, X } from "lucide-react"

interface AlertSystemProps {
  alerts: any[]
  onAlertsUpdate: (alerts: any[]) => void
  trafficData?: any[]
  userLocation?: { lat: number; lng: number } | null
  expanded?: boolean
}

export default function AlertSystem({
  alerts,
  onAlertsUpdate,
  trafficData = [],
  userLocation,
  expanded = false,
}: AlertSystemProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)

  useEffect(() => {
    checkNotificationPermission()
    generateAlerts()
  }, [trafficData, userLocation])

  const checkNotificationPermission = async () => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setNotificationsEnabled(true)
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission()
        setNotificationsEnabled(permission === "granted")
      }
    }
  }

  const generateAlerts = () => {
    if (!userLocation || trafficData.length === 0) return

    const newAlerts = []
    const currentTime = new Date()

    // Check for high congestion areas
    const highCongestionAreas = trafficData.filter((point) => point.congestion > 0.8)
    if (highCongestionAreas.length > 10) {
      newAlerts.push({
        id: Date.now() + 1,
        type: "warning",
        title: "High Traffic Alert",
        message: `${highCongestionAreas.length} areas experiencing heavy congestion`,
        timestamp: currentTime,
        location: userLocation,
        priority: "high",
      })
    }

    // Check for incidents
    const incidents = trafficData.filter((point) => point.incidents)
    incidents.forEach((incident, index) => {
      newAlerts.push({
        id: Date.now() + 2 + index,
        type: "error",
        title: "Traffic Incident",
        message: `${incident.incidents} reported nearby`,
        timestamp: currentTime,
        location: { lat: incident.lat, lng: incident.lng },
        priority: "high",
      })
    })

    // Check for optimal routes
    if (trafficData.some((point) => point.congestion < 0.3)) {
      newAlerts.push({
        id: Date.now() + 100,
        type: "success",
        title: "Clear Route Available",
        message: "Alternative routes with light traffic found",
        timestamp: currentTime,
        location: userLocation,
        priority: "low",
      })
    }

    onAlertsUpdate(newAlerts)

    // Send browser notifications
    if (notificationsEnabled && newAlerts.length > 0) {
      newAlerts.forEach((alert) => {
        if (alert.priority === "high") {
          sendNotification(alert)
        }
      })
    }
  }

  const sendNotification = (alert: any) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(alert.title, {
        body: alert.message,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: alert.id.toString(),
      })
    }

    // Vibration for mobile
    if ("vibrate" in navigator) {
      navigator.vibrate([200, 100, 200])
    }
  }

  const dismissAlert = (alertId: number) => {
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId)
    onAlertsUpdate(updatedAlerts)
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "success":
        return "border-green-200 bg-green-50"
      default:
        return "border-blue-200 bg-blue-50"
    }
  }

  if (!expanded) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            <span className="font-medium">Alert System</span>
          </div>
          <div className="mt-2">
            <Badge variant={alerts.length > 0 ? "destructive" : "secondary"}>
              {alerts.length} Active Alert{alerts.length !== 1 ? "s" : ""}
            </Badge>
            {notificationsEnabled && (
              <Badge variant="outline" className="ml-2">
                Notifications ON
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-orange-600" />
          Smart Alert System
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">Notifications API</Badge>
          <Badge variant="outline">Real-time Monitoring</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Browser Notifications</span>
          <Button
            size="sm"
            variant={notificationsEnabled ? "default" : "outline"}
            onClick={checkNotificationPermission}
          >
            {notificationsEnabled ? "Enabled" : "Enable"}
          </Button>
        </div>

        {alerts.length === 0 ? (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-green-800 font-medium">All Clear!</p>
              <p className="text-green-700 text-sm">No active traffic alerts</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className={`${getAlertColor(alert.type)} border`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{alert.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => dismissAlert(alert.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🔔 Real-time traffic alerts and notifications</p>
          <p>📱 Mobile vibration feedback support</p>
          <p>🎯 Location-based intelligent alerting</p>
        </div>
      </CardContent>
    </Card>
  )
}
