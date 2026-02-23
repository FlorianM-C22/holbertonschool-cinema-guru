import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/navigation/navbar"
import { CarouselSection } from "@/components/carousel-section"
import { HeroSection, type HeroItem } from "@/components/hero-section"
import { PosterCard } from "@/components/poster-card"
import { CarouselSkeletonRow } from "@/components/poster-card-skeleton"
import { useGenres, useImageConfig, useMovieList, useTvList } from "@/data/tmdb/hooks"
import type { MovieCategory, TvCategory, ViewType } from "@/data/tmdb/types"
import { usePrefetchFanart } from "@/data/fanart/usePrefetchFanart"

const MOVIE_SECTION_TITLES: Record<MovieCategory, string> = {
  popular: "Popular movies",
  upcoming: "Upcoming movies",
  top_rated: "Top rated movies",
}

const TV_SECTION_TITLES: Record<TvCategory, string> = {
  popular: "Popular TV",
  upcoming: "Upcoming TV",
  top_rated: "Top rated TV",
}

function HomeContent() {
  const [searchParams] = useSearchParams()
  const view = (searchParams.get("view") ?? "home") as ViewType
  const category = (searchParams.get("category") ?? "popular") as MovieCategory & TvCategory

  const imageConfig = useImageConfig()
  const { getGenreNames } = useGenres()
  const movieCategory: MovieCategory = view === "movies" ? category : "popular"
  const tvCategory: TvCategory = view === "tv" ? category : "popular"
  const movieList = useMovieList(movieCategory)
  const tvList = useTvList(tvCategory)

  const showDefaultView = view === "home"
  const showMoviesView = view === "movies"
  const showTvView = view === "tv"

  const defaultMovies = showDefaultView ? movieList.data?.results ?? [] : []
  const defaultTvShows = showDefaultView ? tvList.data?.results ?? [] : []
  const moviesViewItems = showMoviesView ? movieList.data?.results ?? [] : []
  const tvViewItems = showTvView ? tvList.data?.results ?? [] : []

  const heroItems: HeroItem[] = showDefaultView
    ? [
        ...defaultMovies.slice(0, 3).map((m) => ({
          id: m.id,
          mediaType: "movie" as const,
          title: m.title,
          backdropPath: m.backdrop_path ?? null,
        })),
        ...defaultTvShows.slice(0, 2).map((t) => ({
          id: t.id,
          mediaType: "tv" as const,
          title: t.name,
          backdropPath: t.backdrop_path ?? null,
        })),
      ]
    : []

  const defaultMoviesLoading = showDefaultView && (movieList.isLoading || !imageConfig.loaded)
  const defaultTvLoading = showDefaultView && (tvList.isLoading || !imageConfig.loaded)
  const moviesViewLoading = showMoviesView && (movieList.isLoading || !imageConfig.loaded)
  const tvViewLoading = showTvView && (tvList.isLoading || !imageConfig.loaded)

  const prefetchItems =
    showDefaultView && defaultMovies.length + defaultTvShows.length > 0
      ? [
          ...defaultMovies.slice(0, 8).map((m) => ({ id: m.id, mediaType: "movie" as const })),
          ...defaultTvShows.slice(0, 8).map((t) => ({ id: t.id, mediaType: "tv" as const })),
        ]
      : showMoviesView && moviesViewItems.length > 0
        ? moviesViewItems.slice(0, 12).map((m) => ({ id: m.id, mediaType: "movie" as const }))
        : showTvView && tvViewItems.length > 0
          ? tvViewItems.slice(0, 12).map((t) => ({ id: t.id, mediaType: "tv" as const }))
          : []
  usePrefetchFanart(prefetchItems, { maxItems: 12, concurrency: 3 })

  return (
    <>
      {showDefaultView && heroItems.length > 0 && (
        <HeroSection
          featured={heroItems}
          getBackdropUrl={imageConfig.getBackdropUrl}
        />
      )}
      <div
        key={`${view}-${category}`}
        className="container mx-auto px-4 py-6 animate-in fade-in duration-200"
      >
        {showDefaultView && (
          <>
            <CarouselSection title="Popular movies" fullBleedRight>
            {defaultMoviesLoading ? (
              <CarouselSkeletonRow count={6} />
            ) : (
              defaultMovies.map((item) => (
                <PosterCard
                  key={`movie-${item.id}`}
                  posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                  title={item.title}
                  voteAverage={item.vote_average}
                  id={item.id}
                  mediaType="movie"
                  releaseDate={item.release_date}
                  genreIds={item.genre_ids}
                  getGenreNames={getGenreNames}
                  backdropUrl={imageConfig.getBackdropUrl(item.backdrop_path ?? null)}
                />
              ))
            )}
          </CarouselSection>
          <CarouselSection title="Popular TV" className="mt-10" fullBleedRight>
            {defaultTvLoading ? (
              <CarouselSkeletonRow count={6} />
            ) : (
              defaultTvShows.map((item) => (
                <PosterCard
                  key={`tv-${item.id}`}
                  posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                  title={item.name}
                  voteAverage={item.vote_average}
                  id={item.id}
                  mediaType="tv"
                  releaseDate={item.first_air_date}
                  genreIds={item.genre_ids}
                  getGenreNames={getGenreNames}
                  backdropUrl={imageConfig.getBackdropUrl(item.backdrop_path ?? null)}
                />
              ))
            )}
          </CarouselSection>
        </>
      )}
      {showMoviesView && (
        <CarouselSection title={MOVIE_SECTION_TITLES[category]} fullBleedRight>
          {moviesViewLoading ? (
            <CarouselSkeletonRow count={6} />
          ) : (
            moviesViewItems.map((item) => (
              <PosterCard
                key={`movie-${item.id}`}
                posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                title={item.title}
                voteAverage={item.vote_average}
                id={item.id}
                mediaType="movie"
                releaseDate={item.release_date}
                genreIds={item.genre_ids}
                getGenreNames={getGenreNames}
                backdropUrl={imageConfig.getBackdropUrl(item.backdrop_path ?? null)}
              />
            ))
          )}
        </CarouselSection>
      )}
      {showTvView && (
        <CarouselSection title={TV_SECTION_TITLES[category]} fullBleedRight>
          {tvViewLoading ? (
            <CarouselSkeletonRow count={6} />
          ) : (
            tvViewItems.map((item) => (
              <PosterCard
                key={`tv-${item.id}`}
                posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                title={item.name}
                voteAverage={item.vote_average}
                id={item.id}
                mediaType="tv"
                releaseDate={item.first_air_date}
                genreIds={item.genre_ids}
                getGenreNames={getGenreNames}
                backdropUrl={imageConfig.getBackdropUrl(item.backdrop_path ?? null)}
              />
            ))
          )}
        </CarouselSection>
      )}
      </div>
    </>
  )
}

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HomeContent />
    </div>
  )
}

export { Home }
