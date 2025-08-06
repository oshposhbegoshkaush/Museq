import type { Track } from "./types"

// API key for the AI service
const API_KEY = process.env.GROQ_API_KEY

// API endpoint
const API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions"

// Interface for the composition data to be sent to the API
interface CompositionData {
  tracks: {
    name: string
    instrument: string
    notes: {
      pitch: number
      time: number
      duration: number
    }[]
  }[]
  bpm: number
}

// Convert MIDI pitch to note name (e.g., 60 -> "C4")
function midiPitchToNoteName(pitch: number): string {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const octave = Math.floor(pitch / 12) - 1
  const noteName = noteNames[pitch % 12]
  return `${noteName}${octave}`
}

// Convert tracks to a format suitable for the AI
export function formatCompositionForAI(tracks: Track[], bpm: number): CompositionData {
  return {
    tracks: tracks.map((track) => ({
      name: track.name,
      instrument: track.instrument.type,
      notes: track.notes.map((note) => ({
        pitch: note.pitch,
        time: note.time,
        duration: note.duration,
      })),
    })),
    bpm,
  }
}

// Generate a text description of the composition for the AI
export function generateCompositionDescription(compositionData: CompositionData): string {
  let description = `This is a musical composition with a tempo of ${compositionData.bpm} BPM. It contains ${compositionData.tracks.length} tracks:\n\n`

  compositionData.tracks.forEach((track, index) => {
    if (track.notes.length === 0) return // Skip empty tracks

    description += `Track ${index + 1}: ${track.name} (${track.instrument})\n`
    description += `Contains ${track.notes.length} notes:\n`

    // Group notes by time for better readability
    const notesByTime: Record<number, { pitch: number; duration: number }[]> = {}

    track.notes.forEach((note) => {
      if (!notesByTime[note.time]) {
        notesByTime[note.time] = []
      }
      notesByTime[note.time].push({ pitch: note.pitch, duration: note.duration })
    })

    // Add notes information
    Object.entries(notesByTime).forEach(([time, notes]) => {
      const beat = Math.floor(Number.parseInt(time) / 4) + 1
      const subdivision = (Number.parseInt(time) % 4) + 1
      description += `  Beat ${beat}.${subdivision}: `

      const noteNames = notes.map((note) => midiPitchToNoteName(note.pitch)).join(", ")
      description += `${noteNames}\n`
    })

    description += "\n"
  })

  return description
}

// Get feedback from the AI
export async function getAIFeedback(compositionData: CompositionData): Promise<string> {
  try {
    const description = generateCompositionDescription(compositionData)

    const prompt = `
      You are a music composition expert. Analyze the following musical composition and provide constructive feedback.
      Focus on melody, harmony, rhythm, and structure. Suggest specific improvements that could enhance the composition.
      
      Here's the composition:
      
      ${description}
      
      Please provide your feedback in the following format:
      
      1. Overall Impression: A brief overview of the composition.
      2. Strengths: What works well in this composition.
      3. Areas for Improvement: Specific suggestions for enhancing the composition.
      4. Technical Tips: Any technical advice related to music theory or composition techniques.
      5. Next Steps: Concrete actions the composer could take to develop this piece further.
    `

    const response = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful music composition assistant that provides constructive feedback on musical compositions.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error getting AI feedback:", error)
    throw error
  }
}
