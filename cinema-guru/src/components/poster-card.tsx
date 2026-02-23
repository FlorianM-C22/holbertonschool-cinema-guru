import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { Info, Heart, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import * as fanartApi from "@/data/fanart/api"

type PosterCardProps = {
  posterUrl: string | null
  title: string
  voteAverage?: number
  id: number
  mediaType: "movie" | "tv"
  releaseDate?: string
  genreIds?: number[]
  getGenreNames?: (genreIds: number[], type: "movie" | "tv") => string[]
  backdropUrl?: string | null
  className?: string
}

const FOLDED_WIDTH = "14rem"
const EXPANDED_WIDTH = "32rem"
const CARD_HEIGHT = "21rem"

function PosterCard({
  posterUrl,
  title,
  voteAverage,
  id,
  mediaType,
  releaseDate,
  genreIds = [],
  getGenreNames,
  backdropUrl: backdropUrlProp,
  className,
}: PosterCardProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [fanartBackgroundUrl, setFanartBackgroundUrl] = useState<string | null>(
    null,
  )
  const hasFetchedArt = useRef(false)

  const fetchArt = useCallback(() => {
    if (hasFetchedArt.current) return
    hasFetchedArt.current = true
    if (mediaType === "movie") {
      fanartApi.fetchMovieArt(id).then((art) => {
        setLogoUrl(art.logoUrl)
        setFanartBackgroundUrl(art.backgroundUrl)
      })
    } else {
      fanartApi.fetchTvArt(id).then((art) => {
        setLogoUrl(art.logoUrl)
        setFanartBackgroundUrl(art.backgroundUrl)
      })
    }
  }, [id, mediaType])

  useEffect(() => {
    if (isHovered) fetchArt()
  }, [isHovered, fetchArt])

  const year = releaseDate ? releaseDate.slice(0, 4) : null
  const genreNames =
    getGenreNames?.(genreIds, mediaType).slice(0, 2).join(", ") ?? ""
  const expandedBackgroundUrl =
    fanartBackgroundUrl ?? backdropUrlProp ?? posterUrl

  return (
    <article
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg transition-[width] duration-300 ease-out",
        className,
      )}
      style={{
        width: isHovered ? EXPANDED_WIDTH : FOLDED_WIDTH,
        height: CARD_HEIGHT,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsHovered(false)
      }}
      tabIndex={0}
      aria-expanded={isHovered}
      aria-label={title}
    >
      {!isHovered && (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted shadow-md">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50 text-xs">
              No image
            </div>
          )}
          {voteAverage !== undefined && (
            <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
              {voteAverage.toFixed(1)}
            </span>
          )}
        </div>
      )}

      {isHovered && (
        <div className="relative h-full w-full overflow-hidden rounded-lg shadow-xl">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: expandedBackgroundUrl
                ? `url(${expandedBackgroundUrl})`
                : undefined,
              backgroundColor: "hsl(var(--background))",
            }}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"
            aria-hidden
          />
          <div className="relative flex h-full flex-col justify-end gap-3 p-5 text-white">
            <div className="flex flex-col gap-2">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={title}
                  className="max-h-14 w-full max-w-[260px] object-contain object-left drop-shadow-lg"
                />
              ) : (
                <h3 className="text-xl font-bold leading-tight drop-shadow-md">
                  {title}
                </h3>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-transparent text-white transition-colors hover:bg-white/20"
                  aria-label={t("hero.info")}
                >
                  <Info className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-transparent text-white transition-colors hover:bg-white/20"
                  aria-label={t("hero.addToFavourites")}
                >
                  <Heart className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/80 bg-transparent text-white transition-colors hover:bg-white/20"
                  aria-label={t("hero.watchLater")}
                >
                  <Clock className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-white/90">
                {[year, genreNames].filter(Boolean).join(" · ")}
                {voteAverage !== undefined && ` · ${voteAverage.toFixed(1)}/10`}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export { PosterCard }
export type { PosterCardProps }
