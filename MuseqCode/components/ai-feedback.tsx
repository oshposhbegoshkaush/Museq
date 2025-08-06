"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, ThumbsUp, ThumbsDown, Lightbulb, Loader2 } from "lucide-react"
import { formatCompositionForAI, getAIFeedback } from "@/lib/ai-feedback-api"
import type { Track } from "@/lib/types"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AIFeedbackProps {
  feedback: string
  onRequestFeedback: () => void
  tracks: Track[]
  bpm: number
}

export default function AIFeedback({ feedback, onRequestFeedback, tracks, bpm }: AIFeedbackProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [aiFeedback, setAIFeedback] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleRequestAIFeedback = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Filter out tracks with no notes
      const tracksWithNotes = tracks.filter((track) => track.notes.length > 0)

      if (tracksWithNotes.length === 0) {
        setError("Please add some notes to your composition before requesting feedback.")
        setIsLoading(false)
        return
      }

      // Format the composition data for the AI
      const compositionData = formatCompositionForAI(tracksWithNotes, bpm)

      // Get feedback from the AI
      const feedback = await getAIFeedback(compositionData)

      // Update the feedback state
      setAIFeedback(feedback)
    } catch (error) {
      console.error("Error getting AI feedback:", error)
      setError("An error occurred while getting feedback. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-purple-100 rounded-full p-2">
            <Brain className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="font-medium text-lg text-purple-700">Music Teacher</h3>
        </div>

        <Button
          onClick={handleRequestAIFeedback}
          variant="outline"
          size="lg"
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Thinking...
            </>
          ) : (
            <>
              <Lightbulb className="h-5 w-5 mr-2" />
              Get Feedback
            </>
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <AlertTitle className="text-red-600 font-medium">Oops!</AlertTitle>
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      {aiFeedback ? (
        <Card className="border-purple-200 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full p-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-purple-700">Music Teacher's Feedback</h3>
              </div>
            </div>

            <div className="p-4">
              <div className="prose max-w-none">
                {aiFeedback.split("\n").map((paragraph, index) => (
                  <p key={index} className="text-gray-700 mb-3">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not Helpful
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : feedback ? (
        <Card className="border-purple-200 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 border-b border-purple-200">
              <div className="flex items-center gap-2">
                <div className="bg-white rounded-full p-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium text-purple-700">Music Teacher's Feedback</h3>
              </div>
            </div>

            <div className="p-4">
              <p className="text-gray-700 mb-4">{feedback}</p>

              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Helpful
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-sm bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                >
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  Not Helpful
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-700 text-base mb-2">Learning Tip</h4>
                <p className="text-blue-600">
                  Try to create a melody that has a clear beginning, middle, and end. This is called musical phrasing
                  and helps your music tell a story!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="border-2 border-dashed border-purple-200 rounded-lg p-8 text-center bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-4 rounded-full shadow-sm">
              <Brain className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          <h3 className="text-xl font-medium text-purple-700 mb-2">Ready to hear what your teacher thinks?</h3>
          <p className="text-purple-600 mb-6">Click the button above to get feedback on your awesome music!</p>
          <Button
            onClick={handleRequestAIFeedback}
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Lightbulb className="h-5 w-5 mr-2" />
            Get Feedback
          </Button>
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="font-medium text-yellow-700 mb-2 text-lg flex items-center">
          <span className="mr-2">✨</span>
          What the Music Teacher checks for:
        </h4>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <li className="flex items-center text-yellow-700">
            <span className="mr-2 text-lg">🎵</span>
            Notes that sound good together
          </li>
          <li className="flex items-center text-yellow-700">
            <span className="mr-2 text-lg">🥁</span>
            Cool rhythm patterns
          </li>
          <li className="flex items-center text-yellow-700">
            <span className="mr-2 text-lg">🎹</span>
            If your melody stays in key
          </li>
          <li className="flex items-center text-yellow-700">
            <span className="mr-2 text-lg">🔄</span>
            Balance between repetition and variety
          </li>
          <li className="flex items-center text-yellow-700">
            <span className="mr-2 text-lg">🏗️</span>
            Overall musical structure
          </li>
          <li className="flex items-center text-yellow-700">
            <span className="mr-2 text-lg">🎸</span>
            How instruments work together
          </li>
        </ul>
      </div>
    </div>
  )
}
