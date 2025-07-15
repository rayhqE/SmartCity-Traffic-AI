"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Activity, Zap, Navigation, Brain, Route, Bell, TrendingUp, Share2, Settings, User } from "lucide-react"
import TrafficCanvas from "@/components/traffic-canvas"
import LocationTracker from "@/components/location-tracker"
import NetworkMonitor from "@/components/network-monitor"
import TrafficDataProcessor from "@/components/traffic-data-processor"
import RouteOptimizer from "@/components/route-optimizer"
import TrafficPredictor from "@/components/traffic-predictor"
import AlertSystem from "@/components/alert-system"
import AnalyticsDashboard from "@/components/analytics-dashboard"
import WeatherIntegration from "@/components/weather-integration"
import VoiceCommands from "@/components/voice-commands"
import SocialTrafficReports from "@/components/social-traffic-reports"
import PersonalizedDashboard from "@/components/personalized-dashboard"
import AdvancedFilters from "@/components/advanced-filters"

export default function SmartTrafficMonitor() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [networkInfo, setNetworkInfo] = useState<any>(null)
  const [trafficData, setTrafficData] = useState<any[]>([])
  const [historicalData, setHistoricalData] = useState<any[]>([])
  const [predictions, setPredictions] = useState<any[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [alerts, setAlerts] = useState<any[]>([])
  const [selectedRoute, setSelectedRoute] = useState<any>(null)
  const [userPreferences, setUserPreferences] = useState<any>({
    theme: "auto",
    notifications: true,
    voiceEnabled: false,
    preferredRouteType: "fastest",
  })
  const [socialReports, setSocialReports] = useState<any[]>([])
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const [filters, setFilters] = useState<any>({
    roadType: "all",
    congestionLevel: "all",
    timeRange: "1h",
  })

  const observerRef = useRef<IntersectionObserver | null>(null)
  const [activeTab, setActiveTab] = useState("monitor")

  // Enhanced Intersection Observer with stagger animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          const element = entry.target as HTMLElement

          if (entry.isIntersecting) {
            // Staggered animation delay
            setTimeout(() => {
              element.style.opacity = "1"
              element.style.transform = "translateY(0) scale(1)"
              element.classList.add("animate-in")

              // Add subtle bounce effect
              element.style.animation = "bounceIn 0.6s ease-out"
            }, index * 100)

            if (element.dataset.loadData) {
              loadSectionData(element.dataset.loadData)
            }
          } else {
            element.style.opacity = "0.7"
            element.style.transform = "translateY(20px) scale(0.98)"
          }
        })
      },
      {
        threshold: [0, 0.1, 0.5, 0.9, 1],
        rootMargin: "100px",
      },
    )

    const observeElements = () => {
      const cards = document.querySelectorAll('[data-observe="true"]')
      cards.forEach((card) => observerRef.current?.observe(card))
    }

    // Delay observation to ensure DOM is ready
    setTimeout(observeElements, 100)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  const loadSectionData = (section: string) => {
    switch (section) {
      case "analytics":
        generateAnalyticsData()
        break
      case "predictions":
        generatePredictions()
        break
      case "social":
        generateSocialReports()
        break
      default:
        break
    }
  }

  const handleLocationUpdate = (newLocation: { lat: number; lng: number }) => {
    setLocation(newLocation)
    generateEnhancedTrafficData(newLocation)

    // Enhanced haptic feedback
    if ("vibrate" in navigator) {
      navigator.vibrate([100, 50, 100, 50, 200])
    }

    // Voice feedback if enabled
    if (userPreferences.voiceEnabled && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance("Location updated successfully")
      utterance.rate = 0.8
      utterance.pitch = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const generateEnhancedTrafficData = (loc: { lat: number; lng: number }) => {
    setIsProcessing(true)

    const timeOfDay = new Date().getHours()
    const dayOfWeek = new Date().getDay()
    const isRushHour = (timeOfDay >= 7 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 19)
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const baseTraffic = isRushHour && !isWeekend ? 0.7 : isWeekend ? 0.3 : 0.4

    // Generate more sophisticated traffic data
    const mockData = Array.from({ length: 300 }, (_, i) => {
      const angle = (i / 300) * 2 * Math.PI
      const distance = Math.random() * 0.03
      const roadTypes = ["highway", "arterial", "local", "residential"]
      const roadType = roadTypes[Math.floor(Math.random() * roadTypes.length)]

      // Road type affects congestion patterns
      let congestionMultiplier = 1
      switch (roadType) {
        case "highway":
          congestionMultiplier = 1.2
          break
        case "arterial":
          congestionMultiplier = 1.0
          break
        case "local":
          congestionMultiplier = 0.8
          break
        case "residential":
          congestionMultiplier = 0.5
          break
      }

      const congestion = Math.min(1, baseTraffic * congestionMultiplier + Math.random() * 0.4)

      return {
        id: i,
        lat: loc.lat + Math.cos(angle) * distance,
        lng: loc.lng + Math.sin(angle) * distance,
        congestion,
        speed: Math.max(10, 80 - congestion * 60 + Math.random() * 20),
        timestamp: Date.now() - Math.random() * 3600000,
        roadType,
        incidents:
          Math.random() > 0.95 ? ["accident", "construction", "weather", "event"][Math.floor(Math.random() * 4)] : null,
        volume: Math.floor(Math.random() * 1500) + 200,
        quality: Math.random() * 0.3 + 0.7,
        emissions: congestion * Math.random() * 100,
        noiseLevel: congestion * Math.random() * 80 + 40,
      }
    })

    setTrafficData(mockData)

    // Enhanced historical data tracking
    const historical = [
      ...historicalData,
      {
        timestamp: Date.now(),
        location: loc,
        avgCongestion: mockData.reduce((sum, p) => sum + p.congestion, 0) / mockData.length,
        totalVolume: mockData.reduce((sum, p) => sum + p.volume, 0),
        avgSpeed: mockData.reduce((sum, p) => sum + p.speed, 0) / mockData.length,
        incidents: mockData.filter((p) => p.incidents).length,
        airQuality: Math.random() * 50 + 50,
        weather: {
          temperature: Math.random() * 25 + 10,
          humidity: Math.random() * 40 + 40,
          windSpeed: Math.random() * 20 + 5,
        },
      },
    ].slice(-200) // Keep more historical data

    setHistoricalData(historical)
    setIsProcessing(false)
  }

  const generateAnalyticsData = () => {
    // Enhanced analytics generation
    if (historicalData.length > 0) {
      const analytics = {
        peakHours: findPeakHours(),
        congestionTrends: calculateTrends(),
        routeEfficiency: calculateRouteEfficiency(),
        environmentalImpact: calculateEnvironmentalImpact(),
        userBehaviorPatterns: analyzeUserBehavior(),
      }
    }
  }

  const generatePredictions = () => {
    const futurePredictions = Array.from({ length: 48 }, (_, hour) => ({
      hour: (new Date().getHours() + hour) % 24,
      timestamp: Date.now() + hour * 1800000, // 30-minute intervals
      predictedCongestion: Math.sin((hour / 24) * Math.PI * 2) * 0.3 + 0.5 + (Math.random() * 0.2 - 0.1),
      confidence: Math.random() * 0.3 + 0.7,
      factors: ["weather", "events", "historical_patterns", "social_reports"],
      weatherImpact: Math.random() * 0.2 + 0.9,
      eventImpact: Math.random() > 0.8 ? Math.random() * 0.3 + 1.1 : 1.0,
    }))

    setPredictions(futurePredictions)
  }

  const generateSocialReports = () => {
    const reports = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      user: `User${i + 1}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`,
      location: location
        ? {
            lat: location.lat + (Math.random() - 0.5) * 0.02,
            lng: location.lng + (Math.random() - 0.5) * 0.02,
          }
        : null,
      type: ["accident", "construction", "heavy_traffic", "clear_road", "police"][Math.floor(Math.random() * 5)],
      message: [
        "Heavy traffic on Main St",
        "Accident cleared, traffic flowing",
        "Construction causing delays",
        "Road is clear now!",
        "Police checkpoint ahead",
      ][Math.floor(Math.random() * 5)],
      timestamp: Date.now() - Math.random() * 3600000,
      upvotes: Math.floor(Math.random() * 50),
      verified: Math.random() > 0.7,
      severity: Math.random(),
    }))

    setSocialReports(reports)
  }

  const findPeakHours = () => [7, 8, 9, 17, 18, 19]
  const calculateTrends = () => historicalData.map((d) => d.avgCongestion)
  const calculateRouteEfficiency = () => Math.random() * 0.3 + 0.7
  const calculateEnvironmentalImpact = () => ({
    co2Emissions: Math.random() * 1000 + 500,
    fuelConsumption: Math.random() * 200 + 100,
    airQualityIndex: Math.random() * 100 + 50,
  })
  const analyzeUserBehavior = () => ({
    preferredRoutes: ["Highway 101", "Main Street", "Oak Avenue"],
    travelTimes: ["8:00 AM", "5:30 PM"],
    averageSpeed: 45,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 space-y-8">
        {/* Enhanced Header with Glassmorphism */}
        <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20" data-observe="true">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-75"></div>
                  <div className="relative p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
                    <Navigation className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Smart City Traffic Monitor
                  </CardTitle>
                  <p className="text-slate-600 text-lg mt-1">AI-powered traffic intelligence platform</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <VoiceCommands
                  isActive={isVoiceActive}
                  onToggle={setIsVoiceActive}
                  onCommand={(command) => {
                    // Handle voice commands
                    console.log("Voice command:", command)
                  }}
                />

                <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm hover:bg-white/70">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>

                <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm hover:bg-white/70">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Enhanced Live Statistics with Animations */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 p-4 backdrop-blur-sm border border-blue-200/50 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-blue-700">{trafficData.length}</div>
                  <div className="text-sm text-blue-600 font-medium">Active Sensors</div>
                  <Activity className="absolute top-0 right-0 h-6 w-6 text-blue-500/50" />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/30 p-4 backdrop-blur-sm border border-green-200/50 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-green-700">
                    {trafficData.length > 0
                      ? Math.round(
                          (1 - trafficData.reduce((sum, p) => sum + p.congestion, 0) / trafficData.length) * 100,
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-green-600 font-medium">Traffic Flow</div>
                  <TrendingUp className="absolute top-0 right-0 h-6 w-6 text-green-500/50" />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 p-4 backdrop-blur-sm border border-purple-200/50 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-purple-700">{alerts.length}</div>
                  <div className="text-sm text-purple-600 font-medium">Active Alerts</div>
                  <Bell className="absolute top-0 right-0 h-6 w-6 text-purple-500/50" />
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/30 p-4 backdrop-blur-sm border border-orange-200/50 hover:scale-105 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative">
                  <div className="text-3xl font-bold text-orange-700">
                    {predictions.length > 0 ? Math.round(predictions[0]?.confidence * 100) : 0}%
                  </div>
                  <div className="text-sm text-orange-600 font-medium">AI Confidence</div>
                  <Brain className="absolute top-0 right-0 h-6 w-6 text-orange-500/50" />
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Enhanced Status Cards with Better Spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <LocationTracker onLocationUpdate={handleLocationUpdate} />
          <NetworkMonitor onNetworkUpdate={setNetworkInfo} />
          <WeatherIntegration location={location} />
          <AlertSystem alerts={alerts} onAlertsUpdate={setAlerts} />
        </div>

        {/* Advanced Filters */}
        <AdvancedFilters filters={filters} onFiltersChange={setFilters} />

        {/* Enhanced Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-6 bg-white/30 backdrop-blur-xl border-0 shadow-lg ring-1 ring-white/20 p-2 rounded-2xl">
            <TabsTrigger
              value="monitor"
              className="flex items-center gap-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Monitor</span>
            </TabsTrigger>
            <TabsTrigger
              value="routes"
              className="flex items-center gap-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Route className="h-4 w-4" />
              <span className="hidden sm:inline">Routes</span>
            </TabsTrigger>
            <TabsTrigger
              value="predict"
              className="flex items-center gap-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">AI Predict</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger
              value="social"
              className="flex items-center gap-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger
              value="personal"
              className="flex items-center gap-2 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg rounded-xl transition-all duration-300"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Personal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              <TrafficCanvas
                trafficData={trafficData}
                userLocation={location}
                networkInfo={networkInfo}
                selectedRoute={selectedRoute}
                predictions={predictions}
                filters={filters}
              />
              <TrafficDataProcessor
                trafficData={trafficData}
                onProcessingUpdate={setIsProcessing}
                historicalData={historicalData}
              />
            </div>
          </TabsContent>

          <TabsContent value="routes" className="space-y-8" data-observe="true" data-load-data="routes">
            <RouteOptimizer
              userLocation={location}
              trafficData={trafficData}
              onRouteSelect={setSelectedRoute}
              networkInfo={networkInfo}
              userPreferences={userPreferences}
            />
          </TabsContent>

          <TabsContent value="predict" className="space-y-8" data-observe="true" data-load-data="predictions">
            <TrafficPredictor
              historicalData={historicalData}
              currentTraffic={trafficData}
              predictions={predictions}
              onPredictionsUpdate={setPredictions}
            />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8" data-observe="true" data-load-data="analytics">
            <AnalyticsDashboard
              trafficData={trafficData}
              historicalData={historicalData}
              location={location}
              socialReports={socialReports}
            />
          </TabsContent>

          <TabsContent value="social" className="space-y-8" data-observe="true" data-load-data="social">
            <SocialTrafficReports reports={socialReports} onReportsUpdate={setSocialReports} userLocation={location} />
          </TabsContent>

          <TabsContent value="personal" className="space-y-8">
            <PersonalizedDashboard
              userPreferences={userPreferences}
              onPreferencesUpdate={setUserPreferences}
              historicalData={historicalData}
              trafficData={trafficData}
            />
          </TabsContent>
        </Tabs>

        {/* Enhanced API Usage Information with Better Design */}
        <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-2xl ring-1 ring-white/20" data-observe="true">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                <Zap className="h-6 w-6 text-white" />
              </div>
              Advanced Web APIs Integration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "🌍 Geolocation API",
                  features: [
                    "High-accuracy positioning",
                    "Continuous location tracking",
                    "Distance calculations",
                    "Geofencing alerts",
                  ],
                  gradient: "from-blue-500 to-blue-600",
                },
                {
                  title: "🎨 Canvas API",
                  features: [
                    "Real-time traffic heatmaps",
                    "Interactive route visualization",
                    "Animated traffic flow",
                    "3D visualizations",
                  ],
                  gradient: "from-green-500 to-green-600",
                },
                {
                  title: "👁️ Intersection Observer",
                  features: [
                    "Lazy loading optimization",
                    "Smooth scroll animations",
                    "Performance monitoring",
                    "Dynamic content loading",
                  ],
                  gradient: "from-purple-500 to-purple-600",
                },
                {
                  title: "📡 Network Information",
                  features: [
                    "Adaptive data loading",
                    "Connection quality monitoring",
                    "Bandwidth optimization",
                    "Offline mode detection",
                  ],
                  gradient: "from-orange-500 to-orange-600",
                },
                {
                  title: "⚡ Background Tasks",
                  features: [
                    "Non-blocking AI processing",
                    "Idle time utilization",
                    "Progressive data analysis",
                    "Memory-efficient computing",
                  ],
                  gradient: "from-red-500 to-red-600",
                },
                {
                  title: "🔔 Advanced APIs",
                  features: ["Push Notifications", "Speech Recognition", "Vibration feedback", "IndexedDB storage"],
                  gradient: "from-indigo-500 to-indigo-600",
                },
              ].map((api, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white/50 backdrop-blur-sm p-6 border border-white/20 hover:bg-white/70 transition-all duration-500 hover:scale-105"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${api.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                  ></div>
                  <div className="relative">
                    <h4 className="font-bold text-lg mb-3 text-slate-800">{api.title}</h4>
                    <ul className="space-y-2">
                      {api.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(50px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(-10px);
          }
          70% {
            transform: scale(0.9) translateY(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
      `}</style>
    </div>
  )
}
