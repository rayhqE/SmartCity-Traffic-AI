"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cloud, Sun, CloudRain, CloudSnow } from "lucide-react"

interface WeatherIntegrationProps {
  location: { lat: number; lng: number } | null
}

export default function WeatherIntegration({ location }: WeatherIntegrationProps) {
  const [weather, setWeather] = useState<any>(null)

  useEffect(() => {
    if (location) {
      // Simulate weather data (in real app, would call weather API)
      const mockWeather = {
        condition: ["clear", "rain", "cloudy", "snow"][Math.floor(Math.random() * 4)],
        temperature: Math.round(Math.random() * 30 + 5),
        humidity: Math.round(Math.random() * 50 + 30),
        visibility: Math.round(Math.random() * 5 + 5),
        trafficImpact: Math.random() * 0.3 + 1,
      }
      setWeather(mockWeather)
    }
  }, [location])

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "clear":
        return <Sun className="h-5 w-5 text-yellow-600" />
      case "rain":
        return <CloudRain className="h-5 w-5 text-blue-600" />
      case "snow":
        return <CloudSnow className="h-5 w-5 text-gray-600" />
      default:
        return <Cloud className="h-5 w-5 text-gray-600" />
    }
  }

  const getImpactColor = (impact: number) => {
    if (impact > 1.2) return "bg-red-100 text-red-800"
    if (impact > 1.1) return "bg-yellow-100 text-yellow-800"
    return "bg-green-100 text-green-800"
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {weather ? getWeatherIcon(weather.condition) : <Cloud className="h-5 w-5 text-gray-600" />}
          <span className="font-medium">Weather Impact</span>
        </div>

        {weather && (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm capitalize">{weather.condition}</span>
              <span className="text-sm font-medium">{weather.temperature}°C</span>
            </div>

            <Badge variant="secondary" className={getImpactColor(weather.trafficImpact)}>
              {weather.trafficImpact > 1.2
                ? "High Impact"
                : weather.trafficImpact > 1.1
                  ? "Medium Impact"
                  : "Low Impact"}
            </Badge>

            <div className="text-xs text-muted-foreground">
              <p>Visibility: {weather.visibility}km</p>
              <p>Humidity: {weather.humidity}%</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
