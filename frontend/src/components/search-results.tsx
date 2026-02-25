import { useSearchParams } from "react-router-dom"
import { PosterCard } from "@/components/poster-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useImageConfig, useGenres } from "@/data/tmdb/hooks"
import type { MediaSearchResponse } from "@/data/tmdb/api"

type SearchResultsProps = {
  data: MediaSearchResponse | null
  isLoading: boolean
  error: Error | null
}

function SearchResults({ data, isLoading, error }: SearchResultsProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const imageConfig = useImageConfig()
  const { getGenreNames } = useGenres()

  const currentPage =
    data?.page ??
    (() => {
      const pageParam = searchParams.get("page")
      if (!pageParam) return 1
      const parsed = parseInt(pageParam, 10)
      return Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed
    })()

  const totalPages = data?.total_pages ?? 1

  const goToPage = (page: number) => {
    const next = new URLSearchParams(searchParams)
    if (page <= 1) {
      next.delete("page")
    } else {
      next.set("page", String(page))
    }
    setSearchParams(next)
  }

  if (error) {
    return (
      <section className="mt-4 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
        <p>Search failed. Please try again later.</p>
      </section>
    )
  }

  if (!isLoading && (!data || data.results.length === 0)) {
    return (
      <section className="mt-4 rounded-lg border bg-card/60 p-8 text-center text-sm text-muted-foreground">
        <p>No results found. Try adjusting your filters or search query.</p>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        {isLoading || !imageConfig.loaded
          ? Array.from({ length: 12 }).map((_, index) => (
              <Skeleton key={index} className="h-[21rem] w-full rounded-lg" />
            ))
          : data?.results.map((item) => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="flex flex-col gap-2"
              >
                <PosterCard
                  posterUrl={imageConfig.getPosterUrl(item.posterPath)}
                  title={item.title}
                  voteAverage={item.voteAverage}
                  id={item.id}
                  mediaType={item.mediaType}
                  releaseDate={item.mediaType === "movie" ? item.releaseDate ?? undefined : item.firstAirDate ?? undefined}
                  genreIds={item.genreIds}
                  getGenreNames={getGenreNames}
                  backdropUrl={imageConfig.getBackdropUrl(item.backdropPath)}
                  className="h-[21rem] w-full"
                  layout="grid"
                />
                <span className="inline-flex w-fit rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {item.mediaType === "movie" ? "Movie" : "TV show"}
                </span>
              </div>
            ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-2 flex items-center justify-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => goToPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => goToPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </section>
  )
}

export { SearchResults }

