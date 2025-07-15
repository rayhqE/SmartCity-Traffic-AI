"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, RefreshCw, AlertCircle } from "lucide-react"

interface LocationTrackerProps {
  onLocationUpdate: (location: { lat: number; lng: number }) => void
}

export default function LocationTracker({ onLocationUpdate }: LocationTrackerProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      return
    }

    setIsTracking(true)
    setError(null)

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(newLocation)
        onLocationUpdate(newLocation)
      },
      (error) => {
        setError(`Error: ${error.message}`)
        setIsTracking(false)
      },
      options,
    )

    // Watch position changes
    const id = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setLocation(newLocation)
        onLocationUpdate(newLocation)
      },
      (error) => {
        setError(`Error: ${error.message}`)
      },
      options,
    )

    setWatchId(id)
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsTracking(false)
  }

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Location Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={startTracking} disabled={isTracking} className="flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${isTracking ? "animate-spin" : ""}`} />
            {isTracking ? "Tracking..." : "Start Tracking"}
          </Button>
          {isTracking && (
            <Button variant="outline" onClick={stopTracking}>
              Stop
            </Button>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {location && (
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Location Active
            </Badge>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Latitude:</span>
                <p className="text-muted-foreground">{location.lat.toFixed(6)}</p>
              </div>
              <div>
                <span className="font-medium">Longitude:</span>
                <p className="text-muted-foreground">{location.lng.toFixed(6)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>🌍 Using Geolocation API for real-time position tracking</p>
          <p>📍 High accuracy mode enabled for precise location data</p>
        </div>
      </CardContent>
    </Card>
  )
}
