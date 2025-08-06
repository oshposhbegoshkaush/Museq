// Advanced audio engine for better timing and performance
import { AUDIO_SAMPLES } from "./audio-samples"

// Shared audio context
let sharedAudioContext: AudioContext | null = null
let audioInitialized = false

// Volume levels for different instruments
export const INSTRUMENT_VOLUMES = {
  "acoustic-guitar": 1.0, // 100%
  "clean-electric-guitar": 0.85, // 85%
  "distorted-guitar": 0.85, // 85%
  "piano-acoustic": 0.8, // 80%
  "piano-electric": 0.8, // 80%
  kick: 0.6, // 60%
  hihat: 0.7, // 70%
  snare: 0.8, // 80%
  crash: 1.0, // 100%
  default: 0.8, // Default volume
}

// Cache for loaded audio buffers
const sampleCache: Map<string, AudioBuffer> = new Map()

// Get or create the audio context
export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Resume the audio context if it's suspended (needed for some browsers)
    if (sharedAudioContext.state === "suspended") {
      sharedAudioContext.resume()
    }
  }
  return sharedAudioContext
}

// Initialize audio - call this on user interaction to ensure audio works
export function initializeAudio(): Promise<void> {
  return new Promise((resolve) => {
    if (audioInitialized) {
      resolve()
      return
    }

    const context = getAudioContext()

    // Create a silent buffer and play it to unlock the audio context
    const buffer = context.createBuffer(1, 1, 22050)
    const source = context.createBufferSource()
    source.buffer = buffer
    source.connect(context.destination)
    source.start(0)

    audioInitialized = true
    resolve()
  })
}

// Load an audio sample
export async function loadSample(url: string): Promise<AudioBuffer> {
  // Check if sample is already cached
  if (sampleCache.has(url)) {
    return sampleCache.get(url)!
  }

  try {
    const audioContext = getAudioContext()
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // Cache the loaded sample
    sampleCache.set(url, audioBuffer)

    return audioBuffer
  } catch (error) {
    console.error("Error loading audio sample:", error)
    throw error
  }
}

// Preload all samples
export async function preloadAllSamples(): Promise<void> {
  try {
    // Initialize audio
    await initializeAudio()

    // Load piano samples
    await Promise.all(Object.values(AUDIO_SAMPLES.piano).map((url) => loadSample(url)))

    // Load guitar samples
    await Promise.all(Object.values(AUDIO_SAMPLES.guitar).map((url) => loadSample(url)))

    // Load drum samples
    await Promise.all(Object.values(AUDIO_SAMPLES.drums).map((url) => loadSample(url)))

    console.log("All audio samples loaded successfully")
  } catch (error) {
    console.error("Error preloading samples:", error)
  }
}

// Get the appropriate volume for an instrument
export function getInstrumentVolume(instrumentId: string): number {
  return INSTRUMENT_VOLUMES[instrumentId as keyof typeof INSTRUMENT_VOLUMES] || INSTRUMENT_VOLUMES.default
}

// Schedule a sample to play at a specific time
export function scheduleSample(
  url: string,
  startTime: number,
  pitchShift = 0,
  volume = 1.0,
  instrumentId = "default",
): void {
  const audioContext = getAudioContext()

  // Apply instrument-specific volume
  const instrumentVolume = getInstrumentVolume(instrumentId)
  const finalVolume = volume * instrumentVolume

  // Get the sample from cache or load it
  const playSample = async () => {
    try {
      const buffer = await loadSample(url)

      // Create source node
      const source = audioContext.createBufferSource()
      source.buffer = buffer

      // Apply pitch shifting if needed
      if (pitchShift !== 0) {
        // Convert semitones to playback rate
        // Each semitone is approximately a 5.9% change in frequency
        source.playbackRate.value = Math.pow(2, pitchShift / 12)
      }

      // Create gain node for volume control
      const gainNode = audioContext.createGain()
      gainNode.gain.value = finalVolume

      // Connect nodes
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Schedule the sample to play at the specified time
      source.start(startTime)

      // Clean up when playback ends
      source.onended = () => {
        source.disconnect()
        gainNode.disconnect()
      }
    } catch (error) {
      console.error("Error scheduling sample:", error)
    }
  }

  playSample()
}

// Get the appropriate sample URL for a drum sound
export function getDrumSampleUrl(drumType: string): string {
  switch (drumType.toLowerCase()) {
    case "kick":
      return AUDIO_SAMPLES.drums.kick
    case "snare":
      return AUDIO_SAMPLES.drums.snare
    case "hihat":
      return AUDIO_SAMPLES.drums.hihat
    case "crash":
      return AUDIO_SAMPLES.drums.crash
    default:
      return AUDIO_SAMPLES.drums.kick // Default to kick
  }
}

// Get the appropriate sample URL for a guitar type
export function getGuitarSampleUrl(guitarType: string): string {
  switch (guitarType.toLowerCase()) {
    case "acoustic":
      return AUDIO_SAMPLES.guitar.acoustic
    case "clean":
      return AUDIO_SAMPLES.guitar.clean
    case "distorted":
      return AUDIO_SAMPLES.guitar.distorted
    default:
      return AUDIO_SAMPLES.guitar.acoustic // Default to acoustic
  }
}

// Get the appropriate sample URL for a piano type
export function getPianoSampleUrl(pianoType: string): string {
  switch (pianoType.toLowerCase()) {
    case "acoustic":
      return AUDIO_SAMPLES.piano.acoustic
    case "electric":
      return AUDIO_SAMPLES.piano.electric
    default:
      return AUDIO_SAMPLES.piano.acoustic // Default to acoustic piano
  }
}

// Get the appropriate sample URL for an instrument
export function getInstrumentSampleUrl(instrumentType: string, variant = ""): string {
  switch (instrumentType.toLowerCase()) {
    case "guitar":
      return getGuitarSampleUrl(variant || "acoustic")
    case "piano":
      return getPianoSampleUrl(variant || "acoustic")
    case "drums":
      return getDrumSampleUrl(variant || "kick")
    default:
      return AUDIO_SAMPLES.piano.acoustic // Default to piano
  }
}
