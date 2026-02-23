import { useEffect, useState } from "react"
import { Navbar } from "@/components/navigation/navbar"
import { PosterCard } from "@/components/poster-card"
import { CarouselSection } from "@/components/carousel-section"
import { useImageConfig, useGenres } from "@/data/tmdb/hooks"
import { fetchMovieDetail, fetchTvDetail } from "@/data/tmdb/api"
import { getWatchLater } from "@/data/lists/api"
import { useLists } from "@/data/lists/context"
import type { MovieResultItem, TVSeriesResultItem } from "@lorenzopant/tmdb"

type DetailItem =
  | { mediaType: "movie"; data: MovieResultItem }
  | { mediaType: "tv"; data: TVSeriesResultItem }

function WatchLaterContent() {
  const imageConfig = useImageConfig()
  const { getGenreNames } = useGenres()
  const { watchLaterVersion } = useLists()
  const [details, setDetails] = useState<DetailItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getWatchLater()
      .then((list) => {
        if (cancelled) return
        return Promise.all(
          list.map((e) =>
            e.mediaType === "movie"
              ? fetchMovieDetail(e.tmdbId).then((data) => ({ mediaType: "movie" as const, data }))
              : fetchTvDetail(e.tmdbId).then((data) => ({ mediaType: "tv" as const, data })),
          ),
        )
      })
      .then((items) => {
        if (cancelled || items == null) return
        setDetails(items)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [watchLaterVersion])

  if (!imageConfig.loaded) return null

  const getPosterUrl = imageConfig.getPosterUrl
  const getBackdropUrl = imageConfig.getBackdropUrl

  return (
    <div className="container mx-auto px-4 py-6">
      <CarouselSection title="À regarder plus tard" fullBleedRight>
        {loading ? (
          <div className="flex gap-4 overflow-hidden py-2 text-muted-foreground">
            Chargement…
          </div>
        ) : details.length === 0 ? (
          <p className="py-8 text-muted-foreground">Aucun titre dans « À regarder plus tard ».</p>
        ) : (
          details.map((item) => {
            const isMovie = item.mediaType === "movie"
            const d = item.data as MovieResultItem & TVSeriesResultItem & { genres?: { id: number }[] }
            const title = isMovie ? d.title : d.name
            const releaseDate = isMovie ? d.release_date : d.first_air_date
            const genreIds = d.genres?.map((g) => g.id) ?? d.genre_ids ?? []
            return (
              <PosterCard
                key={`${item.mediaType}-${d.id}`}
                posterUrl={getPosterUrl(d.poster_path ?? null)}
                title={title ?? ""}
                voteAverage={d.vote_average}
                id={d.id}
                mediaType={item.mediaType}
                releaseDate={releaseDate ?? undefined}
                genreIds={genreIds}
                getGenreNames={getGenreNames}
                backdropUrl={getBackdropUrl(d.backdrop_path ?? null)}
              />
            )
          })
        )}
      </CarouselSection>
    </div>
  )
}

function WatchLater() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <WatchLaterContent />
    </div>
  )
}

export { WatchLater }
