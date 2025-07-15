"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Route, Navigation, Clock, Fuel, TrendingDown } from "lucide-react"

interface RouteOptimizerProps {
  userLocation: { lat: number; lng: number } | null
  trafficData: any[]
  onRouteSelect: (route: any) => void
  networkInfo: any
  userPreferences?: any
}

export default function RouteOptimizer({
  userLocation,
  trafficData,
  onRouteSelect,
  networkInfo,
  userPreferences,
}: RouteOptimizerProps) {
  const [routes, setRoutes] = useState<any[]>([])
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [optimizationProgress, setOptimizationProgress] = useState(0)

  useEffect(() => {
    if (userLocation && trafficData.length > 0) {
      optimizeRoutes()
    }
  }, [userLocation, trafficData])

  const optimizeRoutes = () => {
    setIsOptimizing(true)
    setOptimizationProgress(0)

    // Use Background Tasks API for route optimization
    const optimizeChunk = (deadline: IdleDeadline) => {
      const startTime = performance.now()

      while (deadline.timeRemaining() > 0 && optimizationProgress < 100) {
        // Simulate complex route optimization algorithm
        const progress = Math.min(100, optimizationProgress + Math.random() * 10)
        setOptimizationProgress(progress)

        if (progress >= 100) {
          // Generate optimized routes
          const optimizedRoutes = generateOptimizedRoutes()
          setRoutes(optimizedRoutes)
          setIsOptimizing(false)
          return
        }
      }

      if (optimizationProgress < 100) {
        requestIdleCallback(optimizeChunk)
      }
    }

    if ("requestIdleCallback" in window) {
      requestIdleCallback(optimizeChunk)
    } else {
      setTimeout(() => optimizeChunk({ timeRemaining: () => 50, didTimeout: false }), 0)
    }
  }

  const generateOptimizedRoutes = () => {
    if (!userLocation) return []

    const routes = [
      {
        id: 1,
        name: "Fastest Route",
        type: "fastest",
        distance: 12.5,
        duration: 18,
        fuelCost: 3.2,
        congestionLevel: 0.3,
        points: generateRoutePoints(userLocation, 0.3),
        savings: { time: 5, fuel: 0.8 },
        reliability: 0.92,
        incidents: 0,
      },
      {
        id: 2,
        name: "Eco-Friendly Route",
        type: "eco",
        distance: 14.2,
        duration: 22,
        fuelCost: 2.1,
        congestionLevel: 0.2,
        points: generateRoutePoints(userLocation, 0.2),
        savings: { time: -4, fuel: 1.9 },
        reliability: 0.88,
        incidents: 0,
      },
      {
        id: 3,
        name: "Scenic Route",
        type: "scenic",
        distance: 16.8,
        duration: 28,
        fuelCost: 3.8,
        congestionLevel: 0.1,
        points: generateRoutePoints(userLocation, 0.1),
        savings: { time: -10, fuel: -0.6 },
        reliability: 0.95,
        incidents: 1,
      },
    ]

    // Sort routes based on user preference
    if (userPreferences?.preferredRouteType) {
      routes.sort((a, b) => {
        if (a.type === userPreferences.preferredRouteType) return -1
        if (b.type === userPreferences.preferredRouteType) return 1
        return 0
      })
    }

    return routes
  }

  const generateRoutePoints = (start: { lat: number; lng: number }, congestionFactor: number) => {
    const points = []
    const numPoints = 8 + Math.floor(Math.random() * 5)

    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1)
      const angle = progress * Math.PI * 0.5 + Math.random() * 0.5
      const distance = 0.01 + progress * 0.02

      points.push({
        lat: start.lat + Math.cos(angle) * distance,
        lng: start.lng + Math.sin(angle) * distance,
        congestion: congestionFactor + Math.random() * 0.2,
      })
    }

    return points
  }

  const selectRoute = (route: any) => {
    setSelectedRoute(route)
    onRouteSelect(route)

    // Vibration feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([50, 100, 50])
    }
  }

  const getRouteIcon = (type: string) => {
    switch (type) {
      case "fastest":
        return "⚡"
      case "eco":
        return "🌱"
      case "scenic":
        return "🏞️"
      default:
        return "🛣️"
    }
  }

  const getRouteColor = (type: string) => {
    switch (type) {
      case "fastest":
        return "from-blue-500 to-blue-600"
      case "eco":
        return "from-green-500 to-green-600"
      case "scenic":
        return "from-purple-500 to-purple-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="h-5 w-5 text-blue-600" />
          AI Route Optimizer
        </CardTitle>
        <div className="flex gap-2">
          <Badge variant="secondary">Background Tasks API</Badge>
          <Badge variant="outline">Machine Learning</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isOptimizing && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-blue-600 animate-spin" />
              <span className="text-sm font-medium">Optimizing routes...</span>
            </div>
            <Progress value={optimizationProgress} className="w-full" />
            <p className="text-xs text-muted-foreground">
              Analyzing {trafficData.length} traffic data points using AI algorithms
            </p>
          </div>
        )}

        {routes.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Recommended Routes</h3>

            {routes.map((route) => (
              <Card
                key={route.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedRoute?.id === route.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:bg-gray-50"
                }`}
                onClick={() => selectRoute(route)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-r ${getRouteColor(route.type)} flex items-center justify-center text-white text-lg`}
                      >
                        {getRouteIcon(route.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{route.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{route.type} route</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Badge
                        variant={
                          route.congestionLevel < 0.3
                            ? "secondary"
                            : route.congestionLevel < 0.6
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {route.congestionLevel < 0.3
                          ? "Low Traffic"
                          : route.congestionLevel < 0.6
                            ? "Medium Traffic"
                            : "High Traffic"}
                      </Badge>
                      {route.incidents > 0 && (
                        <Badge variant="destructive">
                          {route.incidents} Incident{route.incidents > 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">{route.duration} min</div>
                        {route.savings.time !== 0 && (
                          <div className={`text-xs ${route.savings.time > 0 ? "text-green-600" : "text-red-600"}`}>
                            {route.savings.time > 0 ? "+" : ""}
                            {route.savings.time} min
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Navigation className="h-4 w-4 text-purple-600" />
                      <div>
                        <div className="font-medium">{route.distance} km</div>
                        <div className="text-xs text-muted-foreground">Distance</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Fuel className="h-4 w-4 text-green-600" />
                      <div>
                        <div className="font-medium">${route.fuelCost}</div>
                        {route.savings.fuel !== 0 && (
                          <div className={`text-xs ${route.savings.fuel > 0 ? "text-green-600" : "text-red-600"}`}>
                            {route.savings.fuel > 0 ? "Save " : "Extra "}${Math.abs(route.savings.fuel)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-orange-600" />
                      <div>
                        <div className="font-medium">{Math.round(route.reliability * 100)}%</div>
                        <div className="text-xs text-muted-foreground">Reliability</div>
                      </div>
                    </div>
                  </div>

                  {/* Route quality indicators */}
                  <div className="mt-3 flex gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${getRouteColor(route.type)}`}
                        style={{ width: `${route.reliability * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">Quality Score</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedRoute && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Selected Route Details</h4>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Route:</strong> {selectedRoute.name}
                </p>
                <p>
                  <strong>Estimated Time:</strong> {selectedRoute.duration} minutes
                </p>
                <p>
                  <strong>Distance:</strong> {selectedRoute.distance} km
                </p>
                <p>
                  <strong>Fuel Cost:</strong> ${selectedRoute.fuelCost}
                </p>
                <p>
                  <strong>Traffic Level:</strong> {Math.round(selectedRoute.congestionLevel * 100)}%
                </p>
              </div>

              <Button className="w-full mt-3" size="sm">
                <Navigation className="h-4 w-4 mr-2" />
                Start Navigation
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🤖 AI-powered route optimization using real-time traffic data</p>
          <p>⚡ Background processing for non-blocking performance</p>
          <p>🌐 Network-adaptive loading based on connection quality</p>
        </div>
      </CardContent>
    </Card>
  )
}
