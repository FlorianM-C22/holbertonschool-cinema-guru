import { Navbar } from "@/components/navbar"

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-8">
          <h1 className="text-4xl font-bold">Welcome to Cinema Guru</h1>
          <p className="text-muted-foreground text-center max-w-2xl">
            Your personal movie and TV show discovery platform.
          </p>
        </div>
      </main>
    </div>
  )
}

export { Home }
