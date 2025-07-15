"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Cpu, Clock } from "lucide-react"

interface TrafficDataProcessorProps {
  trafficData: any[]
  onProcessingUpdate: (isProcessing: boolean) => void
}

export default function TrafficDataProcessor({ trafficData, onProcessingUpdate }: TrafficDataProcessorProps) {
  const [processedData, setProcessedData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (trafficData.length > 0) {
      processTrafficData()
    }
  }, [trafficData])

  const processTrafficData = () => {
    setIsProcessing(true)
    onProcessingUpdate(true)
    setProgress(0)

    // Use Background Tasks API (requestIdleCallback) for non-blocking processing
    const processChunk = (deadline: IdleDeadline) => {
      const chunkSize = 10
      let processed = 0

      while (deadline.timeRemaining() > 0 && processed < trafficData.length) {
        // Simulate heavy computation
        const chunk = trafficData.slice(processed, processed + chunkSize)

        // Process traffic patterns, congestion analysis, etc.
        chunk.forEach((point) => {
          // Simulate complex calculations
          const congestionScore = calculateCongestionScore(point)
          const routeOptimization = optimizeRoute(point)
          // Store results...
        })

        processed += chunkSize
        setProgress((processed / trafficData.length) * 100)
      }

      if (processed < trafficData.length) {
        // Continue processing in next idle period
        requestIdleCallback(processChunk)
      } else {
        // Processing complete
        const results = {
          totalPoints: trafficData.length,
          avgCongestion: trafficData.reduce((sum, p) => sum + p.congestion, 0) / trafficData.length,
          avgSpeed: trafficData.reduce((sum, p) => sum + p.speed, 0) / trafficData.length,
          hotspots: findTrafficHotspots(trafficData),
          processedAt: new Date().toISOString(),
        }

        setProcessedData(results)
        setIsProcessing(false)
        onProcessingUpdate(false)
        setProgress(100)
      }
    }

    // Start background processing
    if ("requestIdleCallback" in window) {
      requestIdleCallback(processChunk)
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => processChunk({ timeRemaining: () => 50, didTimeout: false }), 0)
    }
  }

  const calculateCongestionScore = (point: any) => {
    // Simulate complex congestion calculation
    return point.congestion * point.speed * Math.random()
  }

  const optimizeRoute = (point: any) => {
    // Simulate route optimization algorithm
    return {
      alternativeRoute: Math.random() > 0.5,
      timeSaving: Math.random() * 10,
    }
  }

  const findTrafficHotspots = (data: any[]) => {
    return data
      .filter((point) => point.congestion > 0.7)
      .slice(0, 5)
      .map((point) => ({
        lat: point.lat,
        lng: point.lng,
        severity: point.congestion,
      }))
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-orange-600" />
          Background Data Processor
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">Background Tasks API</Badge>
          {isProcessing && <Badge variant="outline">Processing...</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Processing traffic data...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-muted-foreground">Using idle time to avoid blocking the main thread</p>
          </div>
        )}

        {processedData && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Data Points:</span>
                <p className="text-muted-foreground">{processedData.totalPoints}</p>
              </div>
              <div>
                <span className="font-medium">Avg Congestion:</span>
                <p className="text-muted-foreground">{(processedData.avgCongestion * 100).toFixed(1)}%</p>
              </div>
              <div>
                <span className="font-medium">Avg Speed:</span>
                <p className="text-muted-foreground">{processedData.avgSpeed.toFixed(1)} km/h</p>
              </div>
              <div>
                <span className="font-medium">Hotspots:</span>
                <p className="text-muted-foreground">{processedData.hotspots.length} found</p>
              </div>
            </div>

            {processedData.hotspots.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-2">Traffic Hotspots:</h4>
                <div className="space-y-1">
                  {processedData.hotspots.map((hotspot: any, index: number) => (
                    <div key={index} className="text-xs bg-red-50 p-2 rounded">
                      <span className="font-medium">Hotspot {index + 1}:</span>
                      <span className="text-muted-foreground ml-2">
                        {hotspot.lat.toFixed(4)}, {hotspot.lng.toFixed(4)}({(hotspot.severity * 100).toFixed(0)}%
                        congestion)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>🔄 Background processing using requestIdleCallback</p>
          <p>⚡ Non-blocking computation for smooth user experience</p>
        </div>
      </CardContent>
    </Card>
  )
}
