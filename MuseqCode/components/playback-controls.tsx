"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, Square, Save, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlaybackControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onStop: () => void
  bpm: number
  onBpmChange: (value: number) => void
  onClear: () => void
}

export default function PlaybackControls({
  isPlaying,
  onPlayPause,
  onStop,
  bpm,
  onBpmChange,
  onClear,
}: PlaybackControlsProps) {
  return (
    <div className="border rounded-lg shadow-sm bg-white p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className={cn(
              "rounded-full h-14 w-14 flex items-center justify-center",
              isPlaying
                ? "bg-red-100 hover:bg-red-200 text-red-600 border-red-300"
                : "bg-green-100 hover:bg-green-200 text-green-600 border-green-300",
            )}
            onClick={onPlayPause}
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="rounded-full h-14 w-14 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-600 border-blue-300"
            onClick={onStop}
          >
            <Square className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-1 bg-gray-50 p-3 rounded-lg">
          <span className="text-base font-medium text-purple-700">Speed:</span>
          <Slider
            value={[bpm]}
            min={60}
            max={180}
            step={1}
            className="w-32 h-6"
            onValueChange={(value) => onBpmChange(value[0])}
          />
          <span className="text-base font-medium text-purple-700 min-w-[2.5rem]">{bpm}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={onClear}
          >
            <Trash2 className="h-5 w-5 mr-2" />
            Clear
          </Button>

          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Save className="h-5 w-5 mr-2" />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
