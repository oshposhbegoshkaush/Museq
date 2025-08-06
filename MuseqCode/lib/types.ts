export interface Note {
  id: string
  time: number
  pitch: number
  duration: number
  velocity: number
}

export interface InstrumentVariant {
  id: string
  name: string
  soundType: string
  sampleUrl?: string
}

export interface Instrument {
  id: string
  name: string
  type: string
  soundType: string
  color: string
  sampleUrl?: string
  variants?: InstrumentVariant[]
}

export interface Track {
  id: string
  name: string
  instrument: Instrument
  notes: Note[]
}
