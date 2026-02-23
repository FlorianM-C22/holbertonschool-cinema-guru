import { useEffect, useState } from "react"
import { Navbar } from "@/components/navigation/navbar"
import { PosterCard } from "@/components/poster-card"
import { CarouselSection } from "@/components/carousel-section"
import { useImageConfig, useGenres } from "@/data/tmdb/hooks"
import { fetchMovieDetail, fetchTvDetail } from "@/data/tmdb/api"
import { getFavorites } from "@/data/lists/api"
import { useLists } from "@/data/lists/context"
import type { MovieResultItem, TVSeriesResultItem } from "@lorenzopant/tmdb"

type DetailItem =
  | { mediaType: "movie"; data: MovieResultItem }
  | { mediaType: "tv"; data: TVSeriesResultItem }

function FavoritesContent() {
  const imageConfig = useImageConfig()
  const { getGenreNames } = useGenres()
  const { favoritesVersion } = useLists()
  const [details, setDetails] = useState<DetailItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getFavorites()
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
  }, [favoritesVersion])

  if (!imageConfig.loaded) return null

  const getPosterUrl = imageConfig.getPosterUrl
  const getBackdropUrl = imageConfig.getBackdropUrl

  return (
    <div className="container mx-auto px-4 py-6">
      <CarouselSection title="Favoris" fullBleedRight>
        {loading ? (
          <div className="flex gap-4 overflow-hidden py-2 text-muted-foreground">
            Chargement…
          </div>
        ) : details.length === 0 ? (
          <p className="py-8 text-muted-foreground">Aucun favori pour le moment.</p>
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

function Favorites() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <FavoritesContent />
    </div>
  )
}

export { Favorites }
