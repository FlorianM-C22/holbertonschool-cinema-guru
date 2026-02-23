import { useEffect, useState, useRef, useCallback } from "react"
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react"
import * as fanartApi from "@/data/fanart/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const HERO_AUTO_ADVANCE_MS = 5500
const HERO_SLIDE_DURATION_MS = 600
export type HeroItem = {
  id: number
  mediaType: "movie" | "tv"
  title: string
  backdropPath: string | null
}

type HeroSectionProps = {
  featured: HeroItem[]
  getBackdropUrl: (path: string | null | undefined) => string | null
}

type SlideArt = { backgroundUrl: string | null; logoUrl: string | null }

export function HeroSection({ featured, getBackdropUrl }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [slideArts, setSlideArts] = useState<SlideArt[]>([])
  const [showArrows, setShowArrows] = useState(false)
  const autoAdvanceRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const current = featured[currentIndex] ?? null
  const logoUrl = slideArts[currentIndex]?.logoUrl ?? null

  const resetAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current)
      autoAdvanceRef.current = null
    }
    if (featured.length <= 1) return
    autoAdvanceRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % featured.length)
    }, HERO_AUTO_ADVANCE_MS)
  }, [featured.length])

  const pauseAutoAdvance = useCallback(() => {
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current)
      autoAdvanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (featured.length === 0) {
      setSlideArts([])
      return
    }
    let cancelled = false
    const promises = featured.map((item) =>
      item.mediaType === "movie"
        ? fanartApi.fetchMovieArt(item.id)
        : fanartApi.fetchTvArt(item.id),
    )
    Promise.all(promises).then((arts) => {
      if (cancelled) return
      setSlideArts(
        featured.map((item, index) => {
          const art = arts[index]
          const fallback = getBackdropUrl(item.backdropPath)
          return {
            backgroundUrl: art.backgroundUrl ?? fallback,
            logoUrl: art.logoUrl,
          }
        }),
      )
    })
    return () => {
      cancelled = true
    }
  }, [featured, getBackdropUrl])

  useEffect(() => {
    resetAutoAdvance()
    return () => {
      if (autoAdvanceRef.current) {
        clearInterval(autoAdvanceRef.current)
        autoAdvanceRef.current = null
      }
    }
  }, [resetAutoAdvance])

  const goTo = (index: number) => {
    setCurrentIndex(index)
    resetAutoAdvance()
  }

  const goPrev = () => {
    setCurrentIndex((i) => (i - 1 + featured.length) % featured.length)
    resetAutoAdvance()
  }

  const goNext = () => {
    setCurrentIndex((i) => (i + 1) % featured.length)
    resetAutoAdvance()
  }

  if (featured.length === 0) return null
  if (!current) return null

  const slideTransition = `transform ${HERO_SLIDE_DURATION_MS}ms ease-in-out`

  return (
    <section
      className={cn(
        "relative z-40 -mt-16 w-full overflow-hidden bg-muted",
        "h-[min(68vw,36rem)]",
      )}
      aria-label="Featured"
      onMouseEnter={() => {
        setShowArrows(true)
        pauseAutoAdvance()
      }}
      onMouseLeave={() => {
        setShowArrows(false)
        resetAutoAdvance()
      }}
    >
      <div
        className="absolute inset-0 flex"
        style={{
          width: `${featured.length * 100}%`,
          transform: `translateX(-${(currentIndex / featured.length) * 100}%)`,
          transition: slideTransition,
        }}
      >
        {featured.map((item, index) => {
          const url =
            slideArts[index]?.backgroundUrl ?? getBackdropUrl(item.backdropPath)
          return (
            <div
              key={`${item.mediaType}-${item.id}`}
              className="min-w-0 flex-1 bg-cover bg-top bg-no-repeat"
              style={url ? { backgroundImage: `url(${url})` } : undefined}
            />
          )
        })}
      </div>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent 0%, color-mix(in oklch, var(--background) 8%, transparent) 25%, color-mix(in oklch, var(--background) 25%, transparent) 55%, color-mix(in oklch, var(--background) 65%, transparent) 80%, var(--background) 100%)",
        }}
        aria-hidden
      />

      <button
        type="button"
        aria-label="Previous slide"
        onClick={goPrev}
        className={cn(
          "absolute left-0 top-0 z-10 flex h-full w-12 items-center justify-center rounded-r-lg bg-gradient-to-r from-background/80 to-transparent text-foreground transition-opacity duration-200",
          "hover:from-background/95 hover:to-transparent",
          showArrows && featured.length > 1
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronLeft className="h-8 w-8 shrink-0" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={goNext}
        className={cn(
          "absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center rounded-l-lg bg-gradient-to-l from-background/80 to-transparent text-foreground transition-opacity duration-200",
          "hover:from-background/95 hover:to-transparent",
          showArrows && featured.length > 1
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
      >
        <ChevronRight className="h-8 w-8 shrink-0" strokeWidth={2.5} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-col gap-4">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={current.title}
              className="max-h-32 w-full max-w-[560px] object-contain object-left drop-shadow-lg md:max-h-40 md:max-w-[680px]"
            />
          ) : (
            <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-md md:text-4xl">
              {current.title}
            </h2>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="lg" className="gap-2" aria-label="Play">
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
        <div
          role="tablist"
          aria-label="Slide position"
          className="flex justify-center gap-2"
        >
          {featured.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-label={`Slide ${index + 1}`}
              aria-selected={index === currentIndex}
              onClick={() => goTo(index)}
              className={cn(
                "rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                index === currentIndex
                  ? "h-2 w-6 bg-white"
                  : index === featured.length - 1
                    ? "h-1.5 w-1.5 bg-white/40 hover:bg-white/60"
                    : "h-2 w-2 bg-white/40 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
