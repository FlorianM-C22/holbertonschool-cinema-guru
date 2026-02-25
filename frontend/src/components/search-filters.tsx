import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { YearRangeFilter } from "@/components/year-range-filter"
import { useGenres } from "@/data/tmdb/hooks"

const DEFAULT_MIN_YEAR = 1950
const DEFAULT_MAX_YEAR = new Date().getFullYear()

function SearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { movieGenres, tvGenres } = useGenres()

  const typeParam = searchParams.get("type")
  const type: "movie" | "tv" | "all" =
    typeParam === "movie" || typeParam === "tv" || typeParam === "all" ? typeParam : "all"

  const genresParam = searchParams.get("genres")
  const selectedGenreIds = useMemo(
    () =>
      genresParam && genresParam.trim().length > 0
        ? genresParam
            .split(",")
            .map((value) => parseInt(value, 10))
            .filter((value) => !Number.isNaN(value))
        : [],
    [genresParam],
  )

  const yearMinParam = searchParams.get("yearMin")
  const yearMaxParam = searchParams.get("yearMax")

  const initialMinYear =
    yearMinParam !== null && yearMinParam.length > 0
      ? parseInt(yearMinParam, 10)
      : DEFAULT_MIN_YEAR
  const initialMaxYear =
    yearMaxParam !== null && yearMaxParam.length > 0
      ? parseInt(yearMaxParam, 10)
      : DEFAULT_MAX_YEAR

  const [yearRange, setYearRange] = useState<[number, number]>([
    Number.isNaN(initialMinYear) ? DEFAULT_MIN_YEAR : initialMinYear,
    Number.isNaN(initialMaxYear) ? DEFAULT_MAX_YEAR : initialMaxYear,
  ])

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    if (!next.get("yearMin")) {
      next.set("yearMin", String(DEFAULT_MIN_YEAR))
    }
    if (!next.get("yearMax")) {
      next.set("yearMax", String(DEFAULT_MAX_YEAR))
    }
    next.set("type", type)
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next)
    }
  }, [searchParams, setSearchParams, type])

  useEffect(() => {
    setYearRange([
      Number.isNaN(initialMinYear) ? DEFAULT_MIN_YEAR : initialMinYear,
      Number.isNaN(initialMaxYear) ? DEFAULT_MAX_YEAR : initialMaxYear,
    ])
  }, [initialMinYear, initialMaxYear])

  const availableGenres = useMemo(() => {
    if (type === "movie") return movieGenres
    if (type === "tv") return tvGenres
    const all = [...movieGenres, ...tvGenres]
    const seen = new Set<number>()
    return all.filter((genre) => {
      if (seen.has(genre.id)) return false
      seen.add(genre.id)
      return true
    })
  }, [movieGenres, tvGenres, type])

  const toggleGenre = (id: number) => {
    const next = new URLSearchParams(searchParams)
    const current = new Set(selectedGenreIds)
    if (current.has(id)) {
      current.delete(id)
    } else {
      current.add(id)
    }
    const values = Array.from(current.values())
    if (values.length === 0) {
      next.delete("genres")
    } else {
      next.set("genres", values.join(","))
    }
    next.delete("page")
    setSearchParams(next)
  }

  const handleTypeChange = (nextType: "movie" | "tv" | "all") => {
    const next = new URLSearchParams(searchParams)
    next.set("type", nextType)
    next.delete("page")
    setSearchParams(next)
  }

  const handleYearRangeChange = (nextRange: [number, number]) => {
    setYearRange(nextRange)
    const next = new URLSearchParams(searchParams)
    next.set("yearMin", String(nextRange[0]))
    next.set("yearMax", String(nextRange[1]))
    next.delete("page")
    setSearchParams(next)
  }

  const clearFilters = () => {
    const next = new URLSearchParams(searchParams)
    next.delete("genres")
    next.set("yearMin", String(DEFAULT_MIN_YEAR))
    next.set("yearMax", String(DEFAULT_MAX_YEAR))
    next.set("type", "all")
    next.delete("page")
    setSearchParams(next)
  }

  return (
    <section className="mb-6 space-y-4 rounded-lg border bg-card/60 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Type</span>
          <Select
            value={type}
            onValueChange={(next) =>
              handleTypeChange(next as "movie" | "tv" | "all")
            }
          >
            <SelectTrigger className="min-w-[8rem]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Movies &amp; TV shows</SelectItem>
              <SelectItem value="movie">Movies only</SelectItem>
              <SelectItem value="tv">TV shows only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground">Genres</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="min-w-[10rem] justify-between">
                {selectedGenreIds.length > 0
                  ? `${selectedGenreIds.length} selected`
                  : "All genres"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-h-72 w-56 overflow-y-auto">
              {availableGenres.map((genre) => (
                <DropdownMenuCheckboxItem
                  key={genre.id}
                  checked={selectedGenreIds.includes(genre.id)}
                  onCheckedChange={() => toggleGenre(genre.id)}
                >
                  {genre.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Reset filters
          </Button>
        </div>
      </div>

      <div className="mt-1">
        <span className="mb-2 block text-xs font-medium text-muted-foreground">
          Year range
        </span>
        <YearRangeFilter
          minYear={DEFAULT_MIN_YEAR}
          maxYear={DEFAULT_MAX_YEAR}
          value={yearRange}
          onChange={handleYearRangeChange}
        />
      </div>
    </section>
  )
}

export { SearchFilters }

