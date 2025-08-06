// Audio sample URLs
export const AUDIO_SAMPLES = {
  piano: {
    electric:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Electric%20Piano%20-%20C3-woWE0Of0juDyqA99svceYfFrCTAxTh.wav", // Electric Piano - C3
    acoustic:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/small-key-piano-one-shot_C-2HY4STp5zHWRSoTSaAbB2DazVXMI8z.wav", // Acoustic Piano - C
  },
  guitar: {
    acoustic:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Acoustic%20Guitar%20-%20C3-LemOkbGS195dMdEhovQ3fiJ8tmLzOu.wav", // Acoustic Guitar - C3
    clean:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Clean%20Electric%20Guitar%20-%20C3-k1unOpuvdluKuFnbdT1FN1yQMGSDaD.wav", // Clean Electric Guitar - C3
    distorted:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Distorted%20Electric%20Guitar%20-%20C3-M2qD3JXOyfWJF4W9hQhBmyp16xrQO8.wav", // Distorted Electric Guitar - C3
  },
  drums: {
    kick: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Drumkit%20Kick%20-%20C-0IQpbUZi7q1jKf2dhqzqxrGQV6gIQx.wav", // Drumkit Kick
    snare:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Drumkit%20Snare%20-%20C-B0pnt7arg3E5piyPaO0OW318svwsyl.wav", // Drumkit Snare
    hihat:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Drumkit%20Hi-Hat%20-%20C-JDqHempOk7FuzKq6cS2FQRBSA5hS7r.wav", // Drumkit Hi-Hat
    crash:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Drumkit%20Crash%20-%20C-7ezdjQyXrosLjpJSeA3JIvxgTLF68m.wav", // Drumkit Crash
  },
}

// Cache for loaded audio buffers
const sampleCache: Map<string, AudioBuffer> = new Map()

// Shared audio context
let sharedAudioContext: AudioContext | null = null

// Get or create the audio context
export function getAudioContext(): AudioContext {
  if (!sharedAudioContext) {
    sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return sharedAudioContext
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

// Play a sample with pitch shifting for melodic instruments
export function playSample(url: string, pitchShift = 0, volume = 1.0): void {
  const audioContext = getAudioContext()

  // Get the sample from cache or load it
  const getSample = async () => {
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
      gainNode.gain.value = volume

      // Connect nodes
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Play the sample
      source.start()

      // Clean up when playback ends
      source.onended = () => {
        source.disconnect()
        gainNode.disconnect()
      }
    } catch (error) {
      console.error("Error playing sample:", error)
    }
  }

  getSample()
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
