"use client"

import { useState, useRef, useEffect } from "react"
import type { Note, Instrument } from "@/lib/types"
import { cn } from "@/lib/utils"

interface PianoRollProps {
  notes: Note[]
  instrument: Instrument
  onAddNote: (note: Note) => void
  onRemoveNote: (time: number, pitch: number) => void
  isPlaying: boolean
  bpm: number
  currentBeat?: number
}

// Piano note names for labels
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

// Function to get a friendly note name for children
const getFriendlyNoteName = (pitch: number): string => {
  const noteName = NOTE_NAMES[pitch % 12]
  const octave = Math.floor(pitch / 12) - 1

  // Make note names more child-friendly
  if (octave <= 2) return "Low Note"
  if (octave >= 5) return "High Note"
  return "Middle Note"
}

export default function PianoRoll({
  notes,
  instrument,
  onAddNote,
  onRemoveNote,
  isPlaying,
  bpm,
  currentBeat = 0,
}: PianoRollProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState<"add" | "remove">("add")
  const containerRef = useRef<HTMLDivElement>(null)

  // Number of beats (16th notes) in our 4-bar grid (4 bars * 4 beats * 4 sixteenth notes)
  const TOTAL_BEATS = 64
  // Number of pitches in our grid (2 octaves)
  const TOTAL_PITCHES = 24
  // Starting MIDI note number (C3 = 48)
  const START_PITCH = 48

  const handleCellClick = (time: number, pitch: number) => {
    const existingNote = notes.find((n) => n.time === time && n.pitch === pitch)

    if (existingNote) {
      onRemoveNote(time, pitch)
    } else {
      onAddNote({
        id: `note-${time}-${pitch}`,
        time,
        pitch,
        duration: 1,
        velocity: 100,
      })
    }
  }

  const handleMouseDown = (time: number, pitch: number, isNotePresent: boolean) => {
    setIsDragging(true)
    setDragMode(isNotePresent ? "remove" : "add")
    handleCellClick(time, pitch)
  }

  const handleMouseEnter = (time: number, pitch: number, isNotePresent: boolean) => {
    if (isDragging) {
      if (dragMode === "add" && !isNotePresent) {
        onAddNote({
          id: `note-${time}-${pitch}`,
          time,
          pitch,
          duration: 1,
          velocity: 100,
        })
      } else if (dragMode === "remove" && isNotePresent) {
        onRemoveNote(time, pitch)
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  // Get a pastel color based on the instrument
  const getNoteColor = (instrumentColor: string): string => {
    switch (instrumentColor) {
      case "blue":
        return "bg-blue-300 border-blue-400"
      case "green":
        return "bg-green-300 border-green-400"
      case "red":
        return "bg-red-300 border-red-400"
      case "purple":
        return "bg-purple-300 border-purple-400"
      default:
        return "bg-pink-300 border-pink-400"
    }
  }

  const renderGrid = () => {
    const grid = []

    // For each pitch (row)
    for (let pitch = TOTAL_PITCHES - 1; pitch >= 0; pitch--) {
      const row = []
      const actualPitch = START_PITCH + pitch
      const noteName = NOTE_NAMES[actualPitch % 12]
      const isBlackKey = noteName.includes("#")

      // For each time step (column)
      for (let time = 0; time < TOTAL_BEATS; time++) {
        const isNotePresent = notes.some((n) => n.time === time && n.pitch === actualPitch)
        const isCurrentBeatActive = time === currentBeat && isPlaying
        const isMeasureStart = time % 16 === 0
        const isBeatStart = time % 4 === 0

        row.push(
          <div
            key={`cell-${time}-${pitch}`}
            className={cn(
              "h-7 w-7 border-r border-b border-gray-200 transition-all flex-shrink-0 rounded-sm",
              isBlackKey ? "bg-gray-100" : "bg-white",
              isMeasureStart ? "border-l-2 border-l-gray-400" : "",
              isBeatStart ? "border-l border-l-gray-300" : "",
              isCurrentBeatActive ? "bg-yellow-100" : "",
              isNotePresent ? `${getNoteColor(instrument.color)} border shadow-sm scale-95` : "",
              "hover:bg-gray-50",
            )}
            onMouseDown={() => handleMouseDown(time, actualPitch, isNotePresent)}
            onMouseEnter={() => handleMouseEnter(time, actualPitch, isNotePresent)}
          />,
        )
      }

      grid.push(
        <div key={`row-${pitch}`} className="flex w-full">
          <div
            className={cn(
              "w-12 h-7 flex items-center justify-center text-xs font-medium border-r border-gray-300 flex-shrink-0 rounded-l-sm",
              isBlackKey ? "bg-gray-800 text-white" : "bg-gradient-to-r from-pink-50 to-purple-50 text-purple-700",
            )}
          >
            {noteName}
            {Math.floor(actualPitch / 12) + 1}
          </div>
          <div className="flex flex-1 min-w-max">{row}</div>
        </div>,
      )
    }

    return grid
  }

  const renderBeatNumbers = () => {
    const numbers = []

    for (let i = 0; i < TOTAL_BEATS; i++) {
      if (i % 4 === 0) {
        const measureNumber = Math.floor(i / 16) + 1
        const beatNumber = Math.floor((i % 16) / 4) + 1

        numbers.push(
          <div key={`beat-${i}`} className="text-xs text-center w-7 flex-shrink-0 font-medium text-purple-600">
            {i % 16 === 0 ? <span className="font-bold">{measureNumber}</span> : <span>{beatNumber}</span>}
          </div>,
        )
      } else {
        numbers.push(<div key={`beat-${i}`} className="w-7 flex-shrink-0" />)
      }
    }

    return (
      <div className="flex ml-12 mb-1 min-w-max" style={{ width: `${Math.max(1024, TOTAL_BEATS * 7)}px` }}>
        {numbers}
      </div>
    )
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden w-full">
      <div className="p-3 bg-gradient-to-r from-pink-100 to-purple-100 border-b flex justify-between items-center">
        <h3 className="font-medium text-purple-700 text-lg flex items-center">
          <span className="mr-2">
            {instrument.type === "piano"
              ? "🎹"
              : instrument.type === "guitar"
                ? "🎸"
                : instrument.type === "drums"
                  ? "🥁"
                  : "🎵"}
          </span>
          {instrument.name}
        </h3>
        <div className="text-sm text-purple-600 bg-white/50 px-3 py-1 rounded-full">Click or drag to add notes!</div>
      </div>

      <div className="overflow-x-auto">
        {renderBeatNumbers()}

        <div
          ref={containerRef}
          className="overflow-y-auto max-h-[400px] min-w-full"
          style={{ width: `${Math.max(1024, TOTAL_BEATS * 7)}px` }}
        >
          {renderGrid()}
        </div>
      </div>
    </div>
  )
}
