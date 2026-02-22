import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/navigation/navbar"
import { CarouselSection } from "@/components/carousel-section"
import { PosterCard } from "@/components/poster-card"
import { CarouselSkeletonRow } from "@/components/poster-card-skeleton"
import { useImageConfig, useMovieList, useTvList } from "@/data/tmdb/hooks"
import type { MovieCategory, TvCategory, ViewType } from "@/data/tmdb/types"

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

  const defaultMoviesLoading = showDefaultView && (movieList.isLoading || !imageConfig.loaded)
  const defaultTvLoading = showDefaultView && (tvList.isLoading || !imageConfig.loaded)
  const moviesViewLoading = showMoviesView && (movieList.isLoading || !imageConfig.loaded)
  const tvViewLoading = showTvView && (tvList.isLoading || !imageConfig.loaded)

  return (
    <div
      key={`${view}-${category}`}
      className="container mx-auto px-4 py-6 animate-in fade-in duration-200"
    >
      {showDefaultView && (
        <>
          <CarouselSection title="Popular movies">
            {defaultMoviesLoading ? (
              <CarouselSkeletonRow count={6} />
            ) : (
              defaultMovies.map((item) => (
                <PosterCard
                  key={`movie-${item.id}`}
                  posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                  title={item.title}
                  voteAverage={item.vote_average}
                />
              ))
            )}
          </CarouselSection>
          <CarouselSection title="Popular TV" className="mt-10">
            {defaultTvLoading ? (
              <CarouselSkeletonRow count={6} />
            ) : (
              defaultTvShows.map((item) => (
                <PosterCard
                  key={`tv-${item.id}`}
                  posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                  title={item.name}
                  voteAverage={item.vote_average}
                />
              ))
            )}
          </CarouselSection>
        </>
      )}
      {showMoviesView && (
        <CarouselSection title={MOVIE_SECTION_TITLES[category]}>
          {moviesViewLoading ? (
            <CarouselSkeletonRow count={6} />
          ) : (
            moviesViewItems.map((item) => (
              <PosterCard
                key={`movie-${item.id}`}
                posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                title={item.title}
                voteAverage={item.vote_average}
              />
            ))
          )}
        </CarouselSection>
      )}
      {showTvView && (
        <CarouselSection title={TV_SECTION_TITLES[category]}>
          {tvViewLoading ? (
            <CarouselSkeletonRow count={6} />
          ) : (
            tvViewItems.map((item) => (
              <PosterCard
                key={`tv-${item.id}`}
                posterUrl={imageConfig.getPosterUrl(item.poster_path ?? null)}
                title={item.name}
                voteAverage={item.vote_average}
              />
            ))
          )}
        </CarouselSection>
      )}
    </div>
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
