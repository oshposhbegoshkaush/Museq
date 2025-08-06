"use client"

import { useState } from "react"
import type { Track } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Piano, Guitar, Drum, Music } from 'lucide-react'

interface InstrumentPanelProps {
  tracks: Track[]
  activeTrackId: string
  onTrackSelect: (id: string) => void
  onPlaySample?: (track: Track) => void
}

export default function InstrumentPanel({ tracks, activeTrackId, onTrackSelect, onPlaySample }: InstrumentPanelProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("all")

  const getInstrumentIcon = (type: string) => {
    switch (type) {
      case "piano":
        return <Piano className="w-5 h-5" />
      case "guitar":
        return <Guitar className="w-5 h-5" />
      case "drums":
        return <Drum className="w-5 h-5" />
      default:
        return <Music className="w-5 h-5" />
    }
  }

  // Instrument images for children
  const getInstrumentImage = (type: string, name: string) => {
    if (type === "piano") {
      return "/placeholder.svg?height=30&width=30&text=🎹"
    } else if (type === "guitar") {
      return "/placeholder.svg?height=30&width=30&text=🎸"
    } else if (type === "drums") {
      if (name.toLowerCase().includes("kick")) {
        return "/placeholder.svg?height=30&width=30&text=🥁"
      } else if (name.toLowerCase().includes("snare")) {
        return "/placeholder.svg?height=30&width=30&text=🪘"
      } else if (name.toLowerCase().includes("hi")) {
        return "/placeholder.svg?height=30&width=30&text=🔔"
      } else if (name.toLowerCase().includes("crash")) {
        return "/placeholder.svg?height=30&width=30&text=💥"
      }
      return "/placeholder.svg?height=30&width=30&text=🥁"
    }
    return "/placeholder.svg?height=30&width=30&text=🎵"
  }

  const categories = [
    { id: "all", name: "All Instruments", icon: <Music className="w-5 h-5" />, emoji: "🎵" },
    { id: "piano", name: "Piano", icon: <Piano className="w-5 h-5" />, emoji: "🎹" },
    { id: "guitar", name: "Guitar", icon: <Guitar className="w-5 h-5" />, emoji: "🎸" },
    { id: "drums", name: "Drums", icon: <Drum className="w-5 h-5" />, emoji: "🥁" },
  ]

  const filteredTracks =
    expandedCategory === "all" ? tracks : tracks.filter((track) => track.instrument.type === expandedCategory)

  const handleTrackSelect = (track: Track) => {
    onTrackSelect(track.id)
    if (onPlaySample) {
      onPlaySample(track)
    }
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 border-b">
        <h3 className="font-medium text-purple-700 text-lg">Choose an Instrument</h3>
      </div>

      <div className="p-3">
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={expandedCategory === category.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "flex items-center gap-1 rounded-full",
                expandedCategory === category.id
                  ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
                  : "bg-gradient-to-r from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100",
              )}
              onClick={() => setExpandedCategory(category.id)}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </Button>
          ))}
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {filteredTracks.map((track) => (
            <div key={track.id}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start px-3 py-3 h-auto text-sm mb-1 rounded-lg transition-all",
                  activeTrackId === track.id
                    ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 font-medium shadow-sm"
                    : "hover:bg-pink-50",
                )}
                onClick={() => handleTrackSelect(track)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white to-gray-100 shadow-sm flex items-center justify-center border-2 border-gray-200">
                    {track.instrument.type === "piano" && track.name.includes("Acoustic") && (
                      <span className="text-2xl">🎹</span>
                    )}
                    {track.instrument.type === "piano" && track.name.includes("Electric") && (
                      <span className="text-2xl">🎛️</span>
                    )}
                    {track.instrument.type === "guitar" && track.name.includes("Acoustic") && (
                      <span className="text-2xl">🎸</span>
                    )}
                    {track.instrument.type === "guitar" && track.name.includes("Clean") && (
                      <span className="text-2xl">🎸</span>
                    )}
                    {track.instrument.type === "guitar" && track.name.includes("Distorted") && (
                      <span className="text-2xl">⚡</span>
                    )}
                    {track.instrument.type === "drums" && track.name.includes("Kick") && (
                      <span className="text-2xl">🥁</span>
                    )}
                    {track.instrument.type === "drums" && track.name.includes("Snare") && (
                      <span className="text-2xl">🪘</span>
                    )}
                    {track.instrument.type === "drums" && track.name.includes("Hi-Hat") && (
                      <span className="text-2xl">🔔</span>
                    )}
                    {track.instrument.type === "drums" && track.name.includes("Crash") && (
                      <span className="text-2xl">💥</span>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-medium text-gray-800">{track.name}</span>
                    <span className="text-xs text-gray-500 capitalize">{track.instrument.type}</span>
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
