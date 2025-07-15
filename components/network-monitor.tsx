"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, WifiOff } from "lucide-react"

interface NetworkMonitorProps {
  onNetworkUpdate: (networkInfo: any) => void
}

export default function NetworkMonitor({ onNetworkUpdate }: NetworkMonitorProps) {
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    // Network Information API
    const updateNetworkInfo = () => {
      const connection =
        (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection

      if (connection) {
        const info = {
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        }
        setNetworkInfo(info)
        onNetworkUpdate(info)
      }
    }

    // Online/Offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    // Initial network info
    updateNetworkInfo()

    // Event listeners
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Network change listener
    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo)
    }

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo)
      }
    }
  }, [onNetworkUpdate])

  const getConnectionQuality = () => {
    if (!networkInfo) return "unknown"

    switch (networkInfo.effectiveType) {
      case "slow-2g":
      case "2g":
        return "poor"
      case "3g":
        return "good"
      case "4g":
        return "excellent"
      default:
        return "unknown"
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "poor":
        return "bg-red-100 text-red-800"
      case "good":
        return "bg-yellow-100 text-yellow-800"
      case "excellent":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-green-600" /> : <WifiOff className="h-5 w-5 text-red-600" />}
          <span className="font-medium">Network Status</span>
        </div>

        <div className="mt-2 space-y-2">
          <Badge variant="secondary" className={isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>

          {networkInfo && (
            <>
              <Badge variant="secondary" className={getQualityColor(getConnectionQuality())}>
                {networkInfo.effectiveType?.toUpperCase() || "Unknown"}
              </Badge>

              <div className="text-xs text-muted-foreground space-y-1">
                {networkInfo.downlink && <p>Speed: {networkInfo.downlink} Mbps</p>}
                {networkInfo.rtt && <p>Latency: {networkInfo.rtt}ms</p>}
                {networkInfo.saveData && <p className="text-orange-600">Data Saver: ON</p>}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
