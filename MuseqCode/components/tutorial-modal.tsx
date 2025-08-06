"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, Music, MousePointer, Play, Brain, Lightbulb } from "lucide-react"

interface TutorialModalProps {
  onClose: () => void
}

export default function TutorialModal({ onClose }: TutorialModalProps) {
  const [step, setStep] = useState(0)

  const tutorialSteps = [
    {
      title: "Welcome to Museq: A Composition Innovation!",
      icon: <Music className="h-12 w-12 text-purple-500" />,
      emoji: "🎵",
      content: (
        <div className="space-y-3">
          <p className="text-lg">This app helps you create your own music! You'll learn how to:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🎹</span> Choose different instruments
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">👆</span> Place notes on the piano roll
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">▶️</span> Play back your creation
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🧠</span> Get feedback from our Music Teacher
            </li>
          </ul>
          <p className="text-lg font-medium text-purple-600 mt-4">Let's get started with a quick tour of the app!</p>
        </div>
      ),
    },
    {
      title: "Step 1: Choose an Instrument",
      icon: <Music className="h-12 w-12 text-blue-500" />,
      emoji: "🎸",
      content: (
        <div className="space-y-3">
          <p className="text-lg">On the left side of the screen, you'll find the Instrument Panel.</p>
          <p className="text-lg">Click on any instrument to select it. You can choose from:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🎹</span> Pianos - great for melodies
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🎸</span> Guitars - warm, natural sound
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🥁</span> Drums - add rhythm and beats
            </li>
          </ul>
          <div className="text-lg text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-100 mt-2">
            <span className="font-bold">Tip:</span> Try different instruments to see how they sound!
          </div>
        </div>
      ),
    },
    {
      title: "Step 2: Add Notes to the Piano Roll",
      icon: <MousePointer className="h-12 w-12 text-green-500" />,
      emoji: "👆",
      content: (
        <div className="space-y-3">
          <p className="text-lg">
            The grid in the middle is called the Piano Roll. This is where you create your music!
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">👆</span> Click on any square to add a note
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">👆</span> Click again to remove it
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">✋</span> You can also click and drag to add multiple notes quickly
            </li>
          </ul>
          <p className="text-lg">
            The vertical position (up and down) changes the pitch - higher on the grid means higher notes.
          </p>
          <p className="text-lg">The horizontal position (left to right) shows when the note plays in time.</p>
          <div className="text-lg text-green-600 bg-green-50 p-3 rounded-lg border border-green-100 mt-2">
            <span className="font-bold">Tip:</span> Try creating patterns that repeat to make your music sound more
            organized!
          </div>
        </div>
      ),
    },
    {
      title: "Step 3: Play Your Music",
      icon: <Play className="h-12 w-12 text-red-500" />,
      emoji: "▶️",
      content: (
        <div className="space-y-3">
          <p className="text-lg">Once you've added some notes, it's time to hear your creation!</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">▶️</span> Click the Play button to start
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">⏸️</span> Click Pause to stop temporarily
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">⏹️</span> Click the Square button to stop and go back to the beginning
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🎚️</span> Use the Speed slider to change how fast or slow your music plays
            </li>
          </ul>
          <div className="text-lg text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 mt-2">
            <span className="font-bold">Tip:</span> BPM stands for "Beats Per Minute" - higher numbers make your music
            play faster!
          </div>
        </div>
      ),
    },
    {
      title: "Step 4: Get AI Feedback",
      icon: <Brain className="h-12 w-12 text-purple-500" />,
      emoji: "🧠",
      content: (
        <div className="space-y-3">
          <p className="text-lg">Want to know how your music sounds? Our Music Teacher can help!</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🧠</span> Click on the "AI Feedback" tab
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">💡</span> Press the "Get Feedback" button
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">👂</span> The Music Teacher will listen to your music and give you helpful tips
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🔄</span> You can use this feedback to improve your composition
            </li>
          </ul>
          <div className="text-lg text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-100 mt-2">
            <span className="font-bold">Tip:</span> The Music Teacher looks for things like notes that sound good
            together and interesting rhythms!
          </div>
        </div>
      ),
    },
    {
      title: "You're Ready to Make Music!",
      icon: <Lightbulb className="h-12 w-12 text-yellow-500" />,
      emoji: "✨",
      content: (
        <div className="space-y-3">
          <p className="text-lg">Now you know the basics of using Museq!</p>
          <p className="text-lg">
            Remember, there's no right or wrong way to make music - just have fun and experiment!
          </p>
          <p className="text-lg">Here are some ideas to try:</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">😊</span> Create a happy melody using high notes
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">👻</span> Make a spooky tune with lower notes
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🥁</span> Try adding drums to create a steady beat
            </li>
            <li className="flex items-center gap-2 text-lg">
              <span className="text-2xl">🎵</span> Combine different instruments to create a mini song
            </li>
          </ul>
          <p className="text-xl font-medium text-center text-purple-600 mt-4">
            Ready to start creating? Let's make some music!
          </p>
        </div>
      ),
    },
  ]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-xl border-purple-200">
        <DialogHeader className="bg-gradient-to-r from-pink-100 to-purple-100 p-4 rounded-t-lg">
          <DialogTitle className="text-center flex items-center justify-center gap-2 text-purple-700">
            <span className="text-2xl">{tutorialSteps[step].emoji}</span>
            {tutorialSteps[step].title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-6 px-4">{tutorialSteps[step].content}</div>

        <DialogFooter className="flex justify-between sm:justify-between p-4 bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0}
            className="bg-white hover:bg-gray-100"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          {step < tutorialSteps.length - 1 ? (
            <Button
              onClick={() => setStep(Math.min(tutorialSteps.length - 1, step + 1))}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              Start Creating!
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
