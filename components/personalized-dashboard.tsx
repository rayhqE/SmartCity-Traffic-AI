"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { User, Settings, Bell, Palette, Route, Clock, TrendingUp, MapPin, Star } from "lucide-react"

interface PersonalizedDashboardProps {
  userPreferences: any
  onPreferencesUpdate: (preferences: any) => void
  historicalData: any[]
  trafficData: any[]
}

export default function PersonalizedDashboard({
  userPreferences,
  onPreferencesUpdate,
  historicalData,
  trafficData,
}: PersonalizedDashboardProps) {
  const [userStats, setUserStats] = useState<any>(null)

  useEffect(() => {
    calculateUserStats()
  }, [historicalData, trafficData])

  const calculateUserStats = () => {
    const stats = {
      totalTrips: historicalData.length,
      avgTravelTime:
        historicalData.length > 0
          ? Math.round(historicalData.reduce((sum, d) => sum + (d.avgSpeed > 0 ? 30 : 45), 0) / historicalData.length)
          : 0,
      fuelSaved: Math.round(Math.random() * 50 + 20),
      co2Reduced: Math.round(Math.random() * 100 + 50),
      favoriteRoutes: ["Highway 101", "Main Street", "Oak Avenue"],
      peakTravelTimes: ["8:00 AM", "5:30 PM"],
      preferredDays: ["Monday", "Wednesday", "Friday"],
      efficiency: Math.round(Math.random() * 30 + 70),
    }
    setUserStats(stats)
  }

  const updatePreference = (key: string, value: any) => {
    const updated = { ...userPreferences, [key]: value }
    onPreferencesUpdate(updated)

    // Save to localStorage
    localStorage.setItem("trafficMonitorPreferences", JSON.stringify(updated))
  }

  const achievements = [
    { id: 1, title: "Early Adopter", description: "First 100 users", icon: "🏆", unlocked: true },
    { id: 2, title: "Route Master", description: "Used 10+ different routes", icon: "🗺️", unlocked: true },
    { id: 3, title: "Eco Warrior", description: "Saved 50kg CO2", icon: "🌱", unlocked: userStats?.co2Reduced > 50 },
    { id: 4, title: "Community Helper", description: "Submitted 5+ traffic reports", icon: "🤝", unlocked: false },
    { id: 5, title: "Speed Demon", description: "Average speed > 60 km/h", icon: "⚡", unlocked: false },
    { id: 6, title: "Night Owl", description: "Travel after 10 PM", icon: "🦉", unlocked: false },
  ]

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Your Traffic Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-blue-600">{userStats.totalTrips}</div>
                <div className="text-sm text-muted-foreground">Total Trips</div>
              </div>

              <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-green-600">{userStats.avgTravelTime}m</div>
                <div className="text-sm text-muted-foreground">Avg Travel Time</div>
              </div>

              <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-purple-600">{userStats.fuelSaved}L</div>
                <div className="text-sm text-muted-foreground">Fuel Saved</div>
              </div>

              <div className="text-center p-4 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="text-3xl font-bold text-orange-600">{userStats.efficiency}%</div>
                <div className="text-sm text-muted-foreground">Route Efficiency</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preferences Settings */}
      <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-600" />
            Preferences & Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notification Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </h3>

            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                <div>
                  <div className="font-medium">Push Notifications</div>
                  <div className="text-sm text-muted-foreground">Receive traffic alerts and updates</div>
                </div>
                <Switch
                  checked={userPreferences.notifications}
                  onCheckedChange={(checked) => updatePreference("notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                <div>
                  <div className="font-medium">Voice Commands</div>
                  <div className="text-sm text-muted-foreground">Enable hands-free control</div>
                </div>
                <Switch
                  checked={userPreferences.voiceEnabled}
                  onCheckedChange={(checked) => updatePreference("voiceEnabled", checked)}
                />
              </div>
            </div>
          </div>

          {/* Route Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Route className="h-4 w-4" />
              Route Preferences
            </h3>

            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
                <div>
                  <div className="font-medium">Preferred Route Type</div>
                  <div className="text-sm text-muted-foreground">Default route optimization</div>
                </div>
                <Select
                  value={userPreferences.preferredRouteType}
                  onValueChange={(value) => updatePreference("preferredRouteType", value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fastest">Fastest</SelectItem>
                    <SelectItem value="eco">Eco-Friendly</SelectItem>
                    <SelectItem value="scenic">Scenic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Appearance
            </h3>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
              <div>
                <div className="font-medium">Theme</div>
                <div className="text-sm text-muted-foreground">Choose your preferred theme</div>
              </div>
              <Select value={userPreferences.theme} onValueChange={(value) => updatePreference("theme", value)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Travel Patterns */}
      <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Your Travel Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userStats && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Favorite Routes
                  </h4>
                  <div className="space-y-2">
                    {userStats.favoriteRoutes.map((route: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{route}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(Math.random() * 20 + 5)} trips
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white/50 rounded-lg backdrop-blur-sm">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Peak Travel Times
                  </h4>
                  <div className="space-y-2">
                    {userStats.peakTravelTimes.map((time: string, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{time}</span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.floor(Math.random() * 15 + 5)} trips
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-r from-yellow-50/50 to-orange-50/50 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg backdrop-blur-sm border transition-all duration-300 ${
                  achievement.unlocked
                    ? "bg-white/70 border-yellow-200 shadow-md"
                    : "bg-white/30 border-gray-200 opacity-60"
                }`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{achievement.icon}</div>
                  <h4 className="font-semibold text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  {achievement.unlocked && (
                    <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-800">
                      Unlocked
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
