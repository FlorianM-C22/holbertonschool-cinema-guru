import { useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { Navbar } from "@/components/navigation/navbar"
import { useMediaSearch } from "@/data/tmdb/hooks"
import type { MediaSearchParams } from "@/data/tmdb/api"
import { SearchFilters } from "@/components/search-filters"
import { SearchResults } from "@/components/search-results"
import { SearchBar } from "@/components/ui/search-bar"

function parseSearchParams(searchParams: URLSearchParams): MediaSearchParams {
  const query = searchParams.get("q") ?? undefined
  const typeParam = searchParams.get("type")
  const type = typeParam === "movie" || typeParam === "tv" || typeParam === "all" ? typeParam : "all"

  const genresParam = searchParams.get("genres")
  const genreIds =
    genresParam && genresParam.trim().length > 0
      ? genresParam
          .split(",")
          .map((value) => parseInt(value, 10))
          .filter((value) => !Number.isNaN(value))
      : undefined

  const yearMinParam = searchParams.get("yearMin")
  const yearMaxParam = searchParams.get("yearMax")

  const yearMin =
    yearMinParam !== null && yearMinParam.length > 0
      ? (() => {
          const parsed = parseInt(yearMinParam, 10)
          return Number.isNaN(parsed) ? undefined : parsed
        })()
      : undefined

  const yearMax =
    yearMaxParam !== null && yearMaxParam.length > 0
      ? (() => {
          const parsed = parseInt(yearMaxParam, 10)
          return Number.isNaN(parsed) ? undefined : parsed
        })()
      : undefined

  const pageParam = searchParams.get("page")
  const page =
    pageParam !== null && pageParam.length > 0
      ? (() => {
          const parsed = parseInt(pageParam, 10)
          return !Number.isNaN(parsed) && parsed > 0 ? parsed : undefined
        })()
      : undefined

  const params: MediaSearchParams = {
    query,
    type,
    genreIds,
    yearMin,
    yearMax,
    page,
  }

  return params
}

function SearchContent() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => parseSearchParams(searchParams), [searchParams])
  const { data, isLoading, error } = useMediaSearch(filters)

  return (
    <main className="container mx-auto px-4 py-6">
      <div className="mb-4 flex justify-center">
        <SearchBar
          className="w-full max-w-2xl"
          onSearch={(value) => {
            const trimmed = value.trim()
            const next = new URLSearchParams(searchParams)
            if (trimmed.length > 0) {
              next.set("q", trimmed)
            } else {
              next.delete("q")
            }
            next.delete("page")
            setSearchParams(next)
          }}
        />
      </div>
      <SearchFilters />
      <SearchResults
        data={data}
        isLoading={isLoading}
        error={error}
      />
    </main>
  )
}

function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <SearchContent />
    </div>
  )
}

export { SearchPage }

