"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Filter, X, RotateCcw } from "lucide-react"

interface AdvancedFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
}

export default function AdvancedFilters({ filters, onFiltersChange }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const updateFilter = (key: string, value: any) => {
    const updatedFilters = { ...filters, [key]: value }
    onFiltersChange(updatedFilters)
  }

  const resetFilters = () => {
    const defaultFilters = {
      roadType: "all",
      congestionLevel: "all",
      timeRange: "1h",
      speedRange: [0, 100],
      showIncidents: true,
      showConstruction: true,
      minReliability: 50,
    }
    onFiltersChange(defaultFilters)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.roadType !== "all") count++
    if (filters.congestionLevel !== "all") count++
    if (filters.timeRange !== "1h") count++
    if (filters.speedRange?.[0] > 0 || filters.speedRange?.[1] < 100) count++
    if (!filters.showIncidents || !filters.showConstruction) count++
    if (filters.minReliability > 50) count++
    return count
  }

  return (
    <Card className="bg-white/20 backdrop-blur-xl border-0 shadow-xl ring-1 ring-white/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-blue-600" />
            Advanced Filters
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white/50 backdrop-blur-sm hover:bg-white/70"
            >
              {isExpanded ? <X className="h-4 w-4" /> : <Filter className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Quick Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Road Type</label>
              <Select value={filters.roadType} onValueChange={(value) => updateFilter("roadType", value)}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roads</SelectItem>
                  <SelectItem value="highway">Highways</SelectItem>
                  <SelectItem value="arterial">Arterial</SelectItem>
                  <SelectItem value="local">Local Streets</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Congestion Level</label>
              <Select value={filters.congestionLevel} onValueChange={(value) => updateFilter("congestionLevel", value)}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="low">Low (0-30%)</SelectItem>
                  <SelectItem value="medium">Medium (30-70%)</SelectItem>
                  <SelectItem value="high">High (70%+)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Time Range</label>
              <Select value={filters.timeRange} onValueChange={(value) => updateFilter("timeRange", value)}>
                <SelectTrigger className="bg-white/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">Last 15 minutes</SelectItem>
                  <SelectItem value="1h">Last hour</SelectItem>
                  <SelectItem value="6h">Last 6 hours</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Min Reliability</label>
              <div className="px-3 py-2 bg-white/50 backdrop-blur-sm rounded-md border">
                <div className="text-sm font-medium">{filters.minReliability || 50}%</div>
              </div>
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-medium">Speed Range (km/h)</label>
              <div className="px-3">
                <Slider
                  value={filters.speedRange || [0, 100]}
                  onValueChange={(value) => updateFilter("speedRange", value)}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{filters.speedRange?.[0] || 0} km/h</span>
                  <span>{filters.speedRange?.[1] || 100} km/h</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Reliability Threshold</label>
              <div className="px-3">
                <Slider
                  value={[filters.minReliability || 50]}
                  onValueChange={(value) => updateFilter("minReliability", value[0])}
                  max={100}
                  min={0}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>0%</span>
                  <span className="font-medium">{filters.minReliability || 50}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
              <div>
                <div className="font-medium text-sm">Show Incidents</div>
                <div className="text-xs text-muted-foreground">Display traffic incidents</div>
              </div>
              <Switch
                checked={filters.showIncidents !== false}
                onCheckedChange={(checked) => updateFilter("showIncidents", checked)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg backdrop-blur-sm">
              <div>
                <div className="font-medium text-sm">Show Construction</div>
                <div className="text-xs text-muted-foreground">Display construction zones</div>
              </div>
              <Switch
                checked={filters.showConstruction !== false}
                onCheckedChange={(checked) => updateFilter("showConstruction", checked)}
              />
            </div>
          </div>

          {/* Filter Summary */}
          <div className="p-3 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg backdrop-blur-sm">
            <div className="text-sm font-medium mb-2">Active Filters:</div>
            <div className="flex flex-wrap gap-2">
              {filters.roadType !== "all" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Road: {filters.roadType}
                </Badge>
              )}
              {filters.congestionLevel !== "all" && (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  Congestion: {filters.congestionLevel}
                </Badge>
              )}
              {filters.timeRange !== "1h" && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Time: {filters.timeRange}
                </Badge>
              )}
              {(filters.speedRange?.[0] > 0 || filters.speedRange?.[1] < 100) && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Speed: {filters.speedRange?.[0]}-{filters.speedRange?.[1]} km/h
                </Badge>
              )}
              {getActiveFiltersCount() === 0 && (
                <span className="text-sm text-muted-foreground">No filters applied</span>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
