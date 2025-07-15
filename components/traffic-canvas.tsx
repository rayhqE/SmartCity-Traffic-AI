"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Palette, Play, Pause, RotateCcw, Layers } from "lucide-react"

interface TrafficCanvasProps {
  trafficData: any[]
  userLocation: { lat: number; lng: number } | null
  networkInfo: any
  selectedRoute?: any
  predictions?: any[]
  filters?: any
}

export default function TrafficCanvas({
  trafficData,
  userLocation,
  networkInfo,
  selectedRoute,
  predictions,
  filters,
}: TrafficCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [isAnimating, setIsAnimating] = useState(true)
  const [viewMode, setViewMode] = useState<"traffic" | "heatmap" | "predictions">("traffic")
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 })

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    drawEnhancedVisualization(ctx, canvas.offsetWidth, canvas.offsetHeight)

    if (isAnimating) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [trafficData, userLocation, networkInfo, selectedRoute, predictions, viewMode, zoom, offset, isAnimating, filters])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size with device pixel ratio for crisp rendering
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    if (isAnimating) {
      animate()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animate])

  const drawEnhancedVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, "#f8fafc")
    gradient.addColorStop(1, "#e2e8f0")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Apply zoom and pan transformations
    ctx.save()
    ctx.translate(width / 2 + offset.x, height / 2 + offset.y)
    ctx.scale(zoom, zoom)
    ctx.translate(-width / 2, -height / 2)

    // Draw based on view mode
    switch (viewMode) {
      case "traffic":
        drawTrafficView(ctx, width, height)
        break
      case "heatmap":
        drawHeatmapView(ctx, width, height)
        break
      case "predictions":
        drawPredictionsView(ctx, width, height)
        break
    }

    // Draw selected route
    if (selectedRoute) {
      drawRoute(ctx, width, height, selectedRoute)
    }

    // Draw user location with enhanced animation
    if (userLocation) {
      drawEnhancedUserLocation(ctx, width / 2, height / 2)
    }

    // Draw network quality indicator
    if (networkInfo) {
      drawEnhancedNetworkIndicator(ctx, width, height, networkInfo)
    }

    ctx.restore()
  }

  const drawTrafficView = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Enhanced grid with perspective
    drawEnhancedGrid(ctx, width, height)

    // Apply filters to traffic data
    let filteredData = trafficData

    if (filters) {
      filteredData = trafficData.filter((point) => {
        // Road type filter
        if (filters.roadType !== "all" && point.roadType !== filters.roadType) return false

        // Congestion level filter
        if (filters.congestionLevel !== "all") {
          const congestion = point.congestion
          if (filters.congestionLevel === "low" && congestion > 0.3) return false
          if (filters.congestionLevel === "medium" && (congestion <= 0.3 || congestion > 0.7)) return false
          if (filters.congestionLevel === "high" && congestion <= 0.7) return false
        }

        // Speed range filter
        if (filters.speedRange) {
          const [minSpeed, maxSpeed] = filters.speedRange
          if (point.speed < minSpeed || point.speed > maxSpeed) return false
        }

        // Incidents filter
        if (!filters.showIncidents && point.incidents) return false

        return true
      })
    }

    // Draw traffic points with improved visuals
    filteredData.forEach((point, index) => {
      const x = width / 2 + (point.lng - (userLocation?.lng || 0)) * 8000 * zoom
      const y = height / 2 - (point.lat - (userLocation?.lat || 0)) * 8000 * zoom

      if (x >= -50 && x <= width + 50 && y >= -50 && y <= height + 50) {
        drawEnhancedTrafficPoint(ctx, x, y, point, index)
      }
    })

    // Draw traffic flow arrows
    drawTrafficFlow(ctx, width, height)
  }

  const drawHeatmapView = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Create heatmap using ImageData for better performance
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let x = 0; x < width; x += 2) {
      for (let y = 0; y < height; y += 2) {
        const intensity = calculateHeatmapIntensity(x, y, width, height)
        const color = getHeatmapColor(intensity)

        const index = (y * width + x) * 4
        data[index] = color.r
        data[index + 1] = color.g
        data[index + 2] = color.b
        data[index + 3] = color.a
      }
    }

    ctx.putImageData(imageData, 0, 0)
  }

  const drawPredictionsView = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!predictions || predictions.length === 0) return

    // Draw prediction zones
    predictions.forEach((prediction, index) => {
      const angle = (index / predictions.length) * 2 * Math.PI
      const radius = 100 + prediction.predictedCongestion * 50
      const x = width / 2 + Math.cos(angle) * radius
      const y = height / 2 + Math.sin(angle) * radius

      drawPredictionZone(ctx, x, y, prediction)
    })
  }

  const drawEnhancedGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "rgba(148, 163, 184, 0.3)"
    ctx.lineWidth = 1

    const gridSize = 40 * zoom
    const offsetX = offset.x % gridSize
    const offsetY = offset.y % gridSize

    // Vertical lines
    for (let x = offsetX; x <= width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = offsetY; y <= height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  const drawEnhancedTrafficPoint = (ctx: CanvasRenderingContext2D, x: number, y: number, point: any, index: number) => {
    const time = Date.now() / 1000
    const pulse = Math.sin(time * 2 + index * 0.1) * 0.2 + 0.8
    const size = (3 + point.congestion * 7) * pulse

    // Outer glow effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2)
    const hue = (1 - point.congestion) * 120
    gradient.addColorStop(0, `hsla(${hue}, 70%, 50%, 0.8)`)
    gradient.addColorStop(1, `hsla(${hue}, 70%, 50%, 0)`)

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size * 2, 0, 2 * Math.PI)
    ctx.fill()

    // Main point
    ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.fill()

    // Speed indicator ring
    if (point.speed) {
      ctx.strokeStyle = `hsl(${hue}, 70%, 30%)`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(x, y, size + 3, 0, (point.speed / 60) * 2 * Math.PI)
      ctx.stroke()
    }

    // Incident indicator
    if (point.incidents) {
      drawIncidentIndicator(ctx, x, y - size - 8, point.incidents)
    }
  }

  const drawEnhancedUserLocation = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const time = Date.now() / 1000
    const pulse = Math.sin(time * 3) * 0.3 + 0.7

    // Outer pulse ring
    ctx.strokeStyle = `rgba(59, 130, 246, ${pulse * 0.5})`
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y, 25 * pulse, 0, 2 * Math.PI)
    ctx.stroke()

    // Inner location dot
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, 12)
    gradient.addColorStop(0, "#3b82f6")
    gradient.addColorStop(1, "#1d4ed8")

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, 12, 0, 2 * Math.PI)
    ctx.fill()

    // Direction indicator (if available)
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawRoute = (ctx: CanvasRenderingContext2D, width: number, height: number, route: any) => {
    if (!route.points || route.points.length < 2) return

    ctx.strokeStyle = "#8b5cf6"
    ctx.lineWidth = 4
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    // Draw route path with animation
    const time = Date.now() / 1000
    const dashOffset = (time * 20) % 20

    ctx.setLineDash([10, 10])
    ctx.lineDashOffset = dashOffset

    ctx.beginPath()
    route.points.forEach((point: any, index: number) => {
      const x = width / 2 + (point.lng - (userLocation?.lng || 0)) * 8000 * zoom
      const y = height / 2 - (point.lat - (userLocation?.lat || 0)) * 8000 * zoom

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    ctx.setLineDash([])
  }

  const calculateHeatmapIntensity = (x: number, y: number, width: number, height: number) => {
    let intensity = 0
    const centerX = width / 2
    const centerY = height / 2
    const maxDistance = Math.sqrt(width * width + height * height) / 2

    trafficData.forEach((point) => {
      const pointX = centerX + (point.lng - (userLocation?.lng || 0)) * 8000 * zoom
      const pointY = centerY - (point.lat - (userLocation?.lat || 0)) * 8000 * zoom

      const distance = Math.sqrt((x - pointX) ** 2 + (y - pointY) ** 2)
      const influence = Math.max(0, 1 - distance / 50)
      intensity += point.congestion * influence
    })

    return Math.min(1, intensity)
  }

  const getHeatmapColor = (intensity: number) => {
    const colors = [
      { r: 0, g: 255, b: 0, a: 0 }, // Transparent green
      { r: 255, g: 255, b: 0, a: 100 }, // Yellow
      { r: 255, g: 0, b: 0, a: 150 }, // Red
    ]

    const scaledIntensity = intensity * (colors.length - 1)
    const index = Math.floor(scaledIntensity)
    const fraction = scaledIntensity - index

    if (index >= colors.length - 1) return colors[colors.length - 1]

    const color1 = colors[index]
    const color2 = colors[index + 1]

    return {
      r: Math.round(color1.r + (color2.r - color1.r) * fraction),
      g: Math.round(color1.g + (color2.g - color1.g) * fraction),
      b: Math.round(color1.b + (color2.b - color1.b) * fraction),
      a: Math.round(color1.a + (color2.a - color1.a) * fraction),
    }
  }

  const drawPredictionZone = (ctx: CanvasRenderingContext2D, x: number, y: number, prediction: any) => {
    const radius = 30 + prediction.confidence * 20
    const alpha = prediction.confidence * 0.3

    ctx.fillStyle = `rgba(147, 51, 234, ${alpha})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "#9333ea"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`${Math.round(prediction.predictedCongestion * 100)}%`, x, y + 4)
  }

  const drawIncidentIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, incident: string) => {
    const icons = {
      accident: "⚠️",
      construction: "🚧",
      weather: "🌧️",
    }

    ctx.font = "16px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(icons[incident as keyof typeof icons] || "⚠️", x, y)
  }

  const drawTrafficFlow = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw animated flow arrows
    const time = Date.now() / 1000

    trafficData.forEach((point, index) => {
      if (index % 5 !== 0) return // Only draw every 5th arrow for performance

      const x = width / 2 + (point.lng - (userLocation?.lng || 0)) * 8000 * zoom
      const y = height / 2 - (point.lat - (userLocation?.lat || 0)) * 8000 * zoom

      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        const angle = (time + index) % (2 * Math.PI)
        const arrowLength = 15

        ctx.strokeStyle = `rgba(59, 130, 246, 0.6)`
        ctx.lineWidth = 2
        ctx.lineCap = "round"

        // Arrow body
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x + Math.cos(angle) * arrowLength, y + Math.sin(angle) * arrowLength)
        ctx.stroke()

        // Arrow head
        const headAngle1 = angle + Math.PI * 0.8
        const headAngle2 = angle - Math.PI * 0.8
        const headLength = 5

        ctx.beginPath()
        ctx.moveTo(x + Math.cos(angle) * arrowLength, y + Math.sin(angle) * arrowLength)
        ctx.lineTo(
          x + Math.cos(angle) * arrowLength + Math.cos(headAngle1) * headLength,
          y + Math.sin(angle) * arrowLength + Math.sin(headAngle1) * headLength,
        )
        ctx.moveTo(x + Math.cos(angle) * arrowLength, y + Math.sin(angle) * arrowLength)
        ctx.lineTo(
          x + Math.cos(angle) * arrowLength + Math.cos(headAngle2) * headLength,
          y + Math.sin(angle) * arrowLength + Math.sin(headAngle2) * headLength,
        )
        ctx.stroke()
      }
    })
  }

  const drawEnhancedNetworkIndicator = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    networkInfo: any,
  ) => {
    const x = width - 100
    const y = 20

    // Background
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    ctx.roundRect(x - 10, y - 5, 90, 40, 8)
    ctx.fill()

    // Network type
    ctx.fillStyle = "#ffffff"
    ctx.font = "bold 14px sans-serif"
    ctx.fillText(networkInfo.effectiveType?.toUpperCase() || "UNKNOWN", x, y + 12)

    // Signal strength bars
    const bars = 4
    const barWidth = 3
    const barSpacing = 2
    const maxHeight = 15

    for (let i = 0; i < bars; i++) {
      const barHeight = (maxHeight / bars) * (i + 1)
      const barX = x + i * (barWidth + barSpacing)
      const barY = y + 25 - barHeight

      // Determine bar color based on signal strength
      let barColor = "#ef4444" // Red for poor
      if (networkInfo.effectiveType === "4g")
        barColor = "#22c55e" // Green for excellent
      else if (networkInfo.effectiveType === "3g") barColor = "#eab308" // Yellow for good

      ctx.fillStyle = i < getSignalStrength(networkInfo) ? barColor : "rgba(255, 255, 255, 0.3)"
      ctx.fillRect(barX, barY, barWidth, barHeight)
    }
  }

  const getSignalStrength = (networkInfo: any) => {
    switch (networkInfo.effectiveType) {
      case "slow-2g":
      case "2g":
        return 1
      case "3g":
        return 3
      case "4g":
        return 4
      default:
        return 2
    }
  }

  // Mouse interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return

    const deltaX = e.clientX - lastMousePos.x
    const deltaY = e.clientY - lastMousePos.y

    setOffset((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }))

    setLastMousePos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((prev) => Math.max(0.5, Math.min(3, prev * zoomFactor)))
  }

  const resetView = () => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Enhanced Traffic Visualization
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">Canvas API</Badge>
            <Badge variant={isAnimating ? "default" : "outline"}>{isAnimating ? "Live" : "Paused"}</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4">
          <Button size="sm" variant={isAnimating ? "default" : "outline"} onClick={() => setIsAnimating(!isAnimating)}>
            {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          <Button size="sm" variant="outline" onClick={resetView}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <div className="flex gap-1 ml-4">
            {(["traffic", "heatmap", "predictions"] as const).map((mode) => (
              <Button
                key={mode}
                size="sm"
                variant={viewMode === mode ? "default" : "outline"}
                onClick={() => setViewMode(mode)}
              >
                <Layers className="h-4 w-4 mr-1" />
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative">
          <canvas
            ref={canvasRef}
            className="w-full h-96 border rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 cursor-move"
            style={{ width: "100%", height: "384px" }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-white/90 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <span>🔵 Your Location</span>
              <span>🔴 High Traffic</span>
              <span>🟡 Medium</span>
              <span>🟢 Low Traffic</span>
              {selectedRoute && <span>🟣 Selected Route</span>}
            </div>
          </div>

          <div className="absolute top-2 right-2 text-xs text-muted-foreground bg-white/90 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
            <div>Mode: {viewMode}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">Data Points:</span>
            <p className="text-muted-foreground">{trafficData.length}</p>
          </div>
          <div>
            <span className="font-medium">View Mode:</span>
            <p className="text-muted-foreground capitalize">{viewMode}</p>
          </div>
          <div>
            <span className="font-medium">Animation:</span>
            <p className="text-muted-foreground">{isAnimating ? "Active" : "Paused"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
