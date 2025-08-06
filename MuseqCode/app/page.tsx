import MusicComposer from "@/components/music-composer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-2">
          Museq: A Composition Innovation
        </h1>
        <p className="text-center text-purple-600 mb-8 text-xl">
          Create your own awesome melodies and explore music composition! 🎵✨
        </p>
        <MusicComposer />
      </div>
    </main>
  )
}
