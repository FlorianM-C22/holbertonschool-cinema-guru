import { useEffect, useState } from "react"
import { Play, Info } from "lucide-react"
import * as fanartApi from "@/data/fanart/api"
import { Button } from "@/components/ui/button"

export type HeroItem = {
  id: number
  mediaType: "movie" | "tv"
  title: string
  backdropPath: string | null
}

type HeroSectionProps = {
  featured: HeroItem | null
  getBackdropUrl: (path: string | null | undefined) => string | null
}

export function HeroSection({ featured, getBackdropUrl }: HeroSectionProps) {
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!featured) {
      setBackgroundUrl(null)
      return
    }
    let cancelled = false
    const fallback = getBackdropUrl(featured.backdropPath)

    if (featured.mediaType === "movie") {
      fanartApi.fetchMovieArt(featured.id).then((art) => {
        if (!cancelled) {
          setBackgroundUrl(art.backgroundUrl ?? fallback)
        }
      })
    } else {
      fanartApi.fetchTvArt(featured.id).then((art) => {
        if (!cancelled) {
          setBackgroundUrl(art.backgroundUrl ?? fallback)
        }
      })
    }
    return () => {
      cancelled = true
    }
  }, [featured?.id, featured?.mediaType, featured?.backdropPath, getBackdropUrl])

  if (!featured) return null

  const url = backgroundUrl ?? getBackdropUrl(featured.backdropPath)
  if (!url) return null

  return (
    <section
      className="relative h-[min(56vw,28rem)] w-full overflow-hidden bg-muted"
      aria-label="Featured"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${url})` }}
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent"
        aria-hidden
      />
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-6 md:p-10">
        <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
          {featured.title}
        </h2>
        <div className="flex flex-wrap gap-2">
          <Button
            size="lg"
            className="gap-2"
            aria-label="Play"
          >
            <Play className="h-5 w-5" aria-hidden />
            Play
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="gap-2 bg-white/20 text-white hover:bg-white/30"
            aria-label="More info"
          >
            <Info className="h-5 w-5" aria-hidden />
            Info
          </Button>
        </div>
      </div>
    </section>
  )
}
