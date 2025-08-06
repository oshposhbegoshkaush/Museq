"use client"

import { useState, useRef, useEffect } from "react"
import PianoRoll from "./piano-roll"
import InstrumentPanel from "./instrument-panel"
import PlaybackControls from "./playback-controls"
import AIFeedback from "./ai-feedback"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { HelpCircle, Music } from "lucide-react"
import TutorialModal from "./tutorial-modal"
import type { Note, Track } from "@/lib/types"
import { defaultTracks } from "@/lib/default-tracks"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  preloadAllSamples,
  getInstrumentSampleUrl,
  getDrumSampleUrl,
  scheduleSample,
  getAudioContext,
  initializeAudio,
} from "@/lib/audio-engine"

export default function MusicComposer() {
  const [tracks, setTracks] = useState<Track[]>(defaultTracks)
  const [activeTrackId, setActiveTrackId] = useState<string>(defaultTracks[0].id)
  const [isPlaying, setIsPlaying] = useState(false)
  const [bpm, setBpm] = useState(120)
  const [showTutorial, setShowTutorial] = useState(false)
  const [feedback, setFeedback] = useState("")
  const { toast } = useToast()
  const [currentBeat, setCurrentBeat] = useState(0)
  const [samplesLoaded, setSamplesLoaded] = useState(false)

  // Refs for playback
  const schedulerTimerRef = useRef<number | null>(null)
  const nextNoteTimeRef = useRef(0)
  const currentBeatRef = useRef(0)
  const lastBeatDrawnRef = useRef(-1)

  const TOTAL_BEATS = 64 // 4 bars * 4 beats * 4 sixteenth notes
  const LOOKAHEAD = 25.0 // How frequently to call the scheduler (in milliseconds)
  const SCHEDULE_AHEAD_TIME = 0.1 // How far ahead to schedule audio (in seconds)

  // Preload all samples when the component mounts
  useEffect(() => {
    const loadSamples = async () => {
      try {
        await preloadAllSamples()
        setSamplesLoaded(true)
        toast({
          title: "Samples Loaded",
          description: "All audio samples have been loaded successfully.",
        })
      } catch (error) {
        console.error("Failed to load samples:", error)
        toast({
          title: "Error Loading Samples",
          description: "There was a problem loading the audio samples. Some sounds may not work correctly.",
          variant: "destructive",
        })
      }
    }

    loadSamples()

    // Initialize audio on first user interaction
    const handleFirstInteraction = () => {
      initializeAudio().then(() => {
        document.removeEventListener("click", handleFirstInteraction)
        document.removeEventListener("keydown", handleFirstInteraction)
      })
    }

    document.addEventListener("click", handleFirstInteraction)
    document.addEventListener("keydown", handleFirstInteraction)

    return () => {
      document.removeEventListener("click", handleFirstInteraction)
      document.removeEventListener("keydown", handleFirstInteraction)
    }
  }, [toast])

  useEffect(() => {
    // Convert drum variants to separate tracks if they exist
    const expandedTracks = [...tracks]

    // Find the drum kit track
    const drumKitIndex = expandedTracks.findIndex((track) => track.id === "drums")

    if (drumKitIndex !== -1 && expandedTracks[drumKitIndex].instrument.variants) {
      const drumKit = expandedTracks[drumKitIndex]

      // Create individual tracks for each drum variant
      const drumTracks = drumKit.instrument.variants?.map((variant) => ({
        id: variant.id,
        name: variant.name,
        instrument: {
          id: variant.id,
          name: variant.name,
          type: "drums",
          soundType: variant.soundType,
          color: "red",
          sampleUrl: variant.sampleUrl,
        },
        notes: [],
      }))

      // Replace the drum kit track with individual drum tracks
      if (drumTracks && drumTracks.length > 0) {
        expandedTracks.splice(drumKitIndex, 1, ...drumTracks)
        setTracks(expandedTracks)

        // If the active track was the drum kit, set it to the first drum
        if (activeTrackId === "drums") {
          setActiveTrackId(drumTracks[0].id)
        }
      }
    }
  }, []) // Only run once on component mount

  // Calculate time for next note
  const nextNote = () => {
    // Convert tempo from BPM to seconds per beat
    const secondsPerBeat = 60.0 / (bpm * 4) // 16th notes

    // Add beat length to last beat time
    nextNoteTimeRef.current += secondsPerBeat

    // Advance the beat number
    currentBeatRef.current = (currentBeatRef.current + 1) % TOTAL_BEATS
  }

  // Schedule notes to play at the right time
  const scheduleNotes = () => {
    // Get current time
    const audioContext = getAudioContext()

    // Schedule notes from all tracks that need to play in the next window
    while (nextNoteTimeRef.current < audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
      const currentBeat = currentBeatRef.current

      // Schedule all notes that fall on this beat
      tracks.forEach((track) => {
        const notesToPlay = track.notes.filter((note) => note.time === currentBeat)

        notesToPlay.forEach((note) => {
          scheduleNoteWithSample(note.pitch, track, nextNoteTimeRef.current)
        })
      })

      // Move to next note
      nextNote()
    }
  }

  // Draw the current beat indicator
  const drawPlayhead = () => {
    // Only update the UI if the beat has changed
    if (currentBeatRef.current !== lastBeatDrawnRef.current) {
      setCurrentBeat(currentBeatRef.current)
      lastBeatDrawnRef.current = currentBeatRef.current
    }

    // Call again on next animation frame
    requestAnimationFrame(drawPlayhead)
  }

  // Main scheduler function
  const scheduler = () => {
    scheduleNotes()

    // Schedule the next scheduler call
    schedulerTimerRef.current = window.setTimeout(scheduler, LOOKAHEAD)
  }

  // Start playback
  const startPlayback = () => {
    const audioContext = getAudioContext()

    // Reset counters
    currentBeatRef.current = 0
    nextNoteTimeRef.current = audioContext.currentTime

    // Start the scheduler
    scheduler()

    // Start drawing the playhead
    requestAnimationFrame(drawPlayhead)
  }

  // Stop playback
  const stopPlayback = () => {
    if (schedulerTimerRef.current) {
      clearTimeout(schedulerTimerRef.current)
      schedulerTimerRef.current = null
    }

    setCurrentBeat(0)
    lastBeatDrawnRef.current = -1
  }

  // Handle play/pause
  useEffect(() => {
    if (isPlaying) {
      startPlayback()
    } else {
      stopPlayback()
    }

    return () => {
      if (schedulerTimerRef.current) {
        clearTimeout(schedulerTimerRef.current)
      }
    }
  }, [isPlaying, bpm, tracks])

  const handleAddNote = (note: Note) => {
    setTracks(
      tracks.map((track) =>
        track.id === activeTrackId
          ? { ...track, notes: [...track.notes.filter((n) => !(n.time === note.time && n.pitch === note.pitch)), note] }
          : track,
      ),
    )
  }

  const handleRemoveNote = (time: number, pitch: number) => {
    setTracks(
      tracks.map((track) =>
        track.id === activeTrackId
          ? { ...track, notes: track.notes.filter((n) => !(n.time === time && n.pitch === pitch)) }
          : track,
      ),
    )
  }

  const handleClearTrack = () => {
    setTracks(tracks.map((track) => (track.id === activeTrackId ? { ...track, notes: [] } : track)))
    toast({
      title: "Track Cleared",
      description: "All notes have been removed from this track.",
    })
  }

  const getActiveTrack = () => {
    const activeTrack = tracks.find((track) => track.id === activeTrackId)
    return activeTrack || tracks[0]
  }

  const handleRequestFeedback = async () => {
    // Simulate AI feedback
    const feedbackMessages = [
      "Great job! Your melody has a nice rhythm and stays in key.",
      "I notice you're using a lot of notes that work well together. Try adding some variety in rhythm!",
      "Your composition sounds good! Consider adding some lower notes to balance the high ones.",
      "Nice work! Your melody has a clear structure. Try creating a pattern that repeats.",
      "I can hear a good beat! Your notes are in the right key, but watch out for some dissonant notes in bar 3.",
    ]

    setFeedback(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)])
  }

  const scheduleNoteWithSample = (pitch: number, track: Track, time: number) => {
    try {
      const instrument = track.instrument
      const instrumentId = instrument.id

      if (instrument.type === "drums") {
        // For drums, we use the specific drum sample without pitch shifting
        const drumType = instrument.name.toLowerCase().includes("kick")
          ? "kick"
          : instrument.name.toLowerCase().includes("snare")
            ? "snare"
            : instrument.name.toLowerCase().includes("hi")
              ? "hihat"
              : instrument.name.toLowerCase().includes("crash")
                ? "crash"
                : "kick"

        const sampleUrl = instrument.sampleUrl || getDrumSampleUrl(drumType)
        scheduleSample(sampleUrl, time, 0, 0.8, instrumentId) // No pitch shift for drums
      } else {
        // For melodic instruments, we use pitch shifting
        const sampleUrl = instrument.sampleUrl || getInstrumentSampleUrl(instrument.type)

        // Calculate pitch shift in semitones from the base note
        // Assuming the sample is recorded at C3 (MIDI note 60)
        const basePitch = 60
        const pitchShift = pitch - basePitch

        scheduleSample(sampleUrl, time, pitchShift, 0.7, instrumentId)
      }
    } catch (e) {
      console.error("Error scheduling sample:", e)
    }
  }

  // For immediate playback when adding notes
  const playNoteImmediately = (pitch: number, track: Track) => {
    try {
      const instrument = track.instrument
      const instrumentId = instrument.id
      const audioContext = getAudioContext()

      if (instrument.type === "drums") {
        const drumType = instrument.name.toLowerCase().includes("kick")
          ? "kick"
          : instrument.name.toLowerCase().includes("snare")
            ? "snare"
            : instrument.name.toLowerCase().includes("hi")
              ? "hihat"
              : instrument.name.toLowerCase().includes("crash")
                ? "crash"
                : "kick"

        const sampleUrl = instrument.sampleUrl || getDrumSampleUrl(drumType)
        scheduleSample(sampleUrl, audioContext.currentTime, 0, 0.8, instrumentId)
      } else {
        const sampleUrl = instrument.sampleUrl || getInstrumentSampleUrl(instrument.type)
        const basePitch = 60
        const pitchShift = pitch - basePitch
        scheduleSample(sampleUrl, audioContext.currentTime, pitchShift, 0.7, instrumentId)
      }
    } catch (e) {
      console.error("Error playing sample immediately:", e)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-pink-400 to-purple-400 text-white flex justify-between items-center">
        <div className="flex items-center">
          <Music className="w-8 h-8 mr-2" />
          <h2 className="text-xl font-bold">Music Studio</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-white/40"
          onClick={() => setShowTutorial(true)}
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          How to Use
        </Button>
      </div>

      {!samplesLoaded && (
        <div className="p-4 bg-yellow-50 text-yellow-800 text-center">Loading audio samples... Please wait.</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-4">
        <div className="lg:col-span-1">
          <InstrumentPanel
            tracks={tracks}
            activeTrackId={activeTrackId}
            onTrackSelect={setActiveTrackId}
            onPlaySample={(track) => {
              // Play a sample note when selecting an instrument
              const samplePitch = 60 // Middle C
              playNoteImmediately(samplePitch, track)
            }}
          />
        </div>

        <div className="lg:col-span-3">
          <Tabs defaultValue="compose" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="compose" className="text-lg rounded-t-lg">
                Compose
              </TabsTrigger>
              <TabsTrigger value="feedback" className="text-lg rounded-t-lg">
                AI Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <PianoRoll
                notes={getActiveTrack().notes}
                instrument={getActiveTrack().instrument}
                onAddNote={(note) => {
                  handleAddNote(note)
                  // Play the note when added
                  playNoteImmediately(note.pitch, getActiveTrack())
                }}
                onRemoveNote={handleRemoveNote}
                isPlaying={isPlaying}
                bpm={bpm}
                currentBeat={currentBeat}
              />

              <PlaybackControls
                isPlaying={isPlaying}
                onPlayPause={() => setIsPlaying(!isPlaying)}
                onStop={() => setIsPlaying(false)}
                bpm={bpm}
                onBpmChange={setBpm}
                onClear={handleClearTrack}
              />
            </TabsContent>

            <TabsContent value="feedback">
              <AIFeedback feedback={feedback} onRequestFeedback={handleRequestFeedback} tracks={tracks} bpm={bpm} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      <Toaster />
    </div>
  )
}
