import { apiGet } from "@/data/apiClient"
import type { MovieCategory, TvCategory } from "./types"
import type {
  ConfigurationResponse,
  MovieResultItem,
  PaginatedResponse,
  TVSeriesResultItem,
} from "@lorenzopant/tmdb"

const POSTER_SIZE = "w342"
const BACKDROP_SIZE = "w1280"

let cachedConfig: ConfigurationResponse | null = null

async function getImageConfig(): Promise<ConfigurationResponse> {
  if (cachedConfig) return cachedConfig
  cachedConfig = await apiGet<ConfigurationResponse>("/tmdb/config")
  return cachedConfig
}

function buildPosterUrl(baseUrl: string, posterPath: string | null | undefined): string | null {
  if (!posterPath) return null
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  return `${base}${POSTER_SIZE}${posterPath}`
}

async function getPosterUrl(posterPath: string | null | undefined): Promise<string | null> {
  const config = await getImageConfig()
  return buildPosterUrl(config.images.secure_base_url, posterPath)
}

function getPosterUrlSync(posterPath: string | null | undefined): string | null {
  if (!cachedConfig) return null
  return buildPosterUrl(cachedConfig.images.secure_base_url, posterPath)
}

function buildBackdropUrl(baseUrl: string, backdropPath: string | null | undefined): string | null {
  if (!backdropPath) return null
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  return `${base}${BACKDROP_SIZE}${backdropPath}`
}

function getBackdropUrlSync(backdropPath: string | null | undefined): string | null {
  if (!cachedConfig) return null
  return buildBackdropUrl(cachedConfig.images.secure_base_url, backdropPath)
}

async function fetchMovieList(
  category: MovieCategory,
  params?: { page?: number }
): Promise<PaginatedResponse<MovieResultItem>> {
  const page = params?.page ?? 1
  return apiGet<PaginatedResponse<MovieResultItem>>(
    `/tmdb/movies/${category}?page=${page}`
  )
}

async function fetchTvList(
  category: TvCategory,
  params?: { page?: number }
): Promise<PaginatedResponse<TVSeriesResultItem>> {
  const page = params?.page ?? 1
  return apiGet<PaginatedResponse<TVSeriesResultItem>>(
    `/tmdb/tv/${category}?page=${page}`
  )
}

type Genre = { id: number; name: string }
let cachedMovieGenres: Genre[] | null = null
let cachedTvGenres: Genre[] | null = null

async function fetchMovieGenres(): Promise<Genre[]> {
  if (cachedMovieGenres) return cachedMovieGenres
  const res = await apiGet<{ genres: Genre[] }>("/tmdb/genres/movies")
  cachedMovieGenres = res.genres ?? []
  return cachedMovieGenres
}

async function fetchTvGenres(): Promise<Genre[]> {
  if (cachedTvGenres) return cachedTvGenres
  const res = await apiGet<{ genres: Genre[] }>("/tmdb/genres/tv")
  cachedTvGenres = res.genres ?? []
  return cachedTvGenres
}

function getGenreNames(genreIds: number[], type: "movie" | "tv"): string[] {
  const map = type === "movie" ? cachedMovieGenres : cachedTvGenres
  if (!map) return []
  return genreIds
    .map((id) => map.find((g) => g.id === id)?.name)
    .filter((n): n is string => Boolean(n))
}

const cacheTvExternalIds = new Map<number, number | null>()

async function fetchTvExternalIds(tmdbId: number): Promise<number | null> {
  const cached = cacheTvExternalIds.get(tmdbId)
  if (cached !== undefined) return cached
  try {
    const data = await apiGet<{ tvdb_id: number | null }>(`/tmdb/tv/${tmdbId}/external_ids`)
    const tvdb = data.tvdb_id ?? null
    cacheTvExternalIds.set(tmdbId, tvdb)
    return tvdb
  } catch {
    cacheTvExternalIds.set(tmdbId, null)
    return null
  }
}

export {
  getImageConfig,
  getPosterUrl,
  getPosterUrlSync,
  getBackdropUrlSync,
  fetchMovieList,
  fetchTvList,
  fetchMovieGenres,
  fetchTvGenres,
  getGenreNames,
  fetchTvExternalIds,
}
export type { MovieResultItem, TVSeriesResultItem, PaginatedResponse }
