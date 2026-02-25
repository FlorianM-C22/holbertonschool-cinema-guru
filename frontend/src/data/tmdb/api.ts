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
const PROFILE_SIZE = "w185"

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

function buildProfileUrl(baseUrl: string, profilePath: string | null | undefined): string | null {
  if (!profilePath) return null
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
  return `${base}${PROFILE_SIZE}${profilePath}`
}

function getProfileUrlSync(profilePath: string | null | undefined): string | null {
  if (!cachedConfig) return null
  return buildProfileUrl(cachedConfig.images.secure_base_url, profilePath)
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

async function fetchMovieDetail(tmdbId: number) {
  return apiGet<MovieResultItem>(`/tmdb/movies/${tmdbId}/detail`)
}

async function fetchTvDetail(tmdbId: number) {
  return apiGet<TVSeriesResultItem>(`/tmdb/tv/${tmdbId}/detail`)
}

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

type MediaSearchResult = {
  id: number
  tmdbId: number
  mediaType: "movie" | "tv"
  title: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  voteCount: number
  popularity: number
  releaseDate: string | null
  firstAirDate: string | null
  genreIds: number[]
}

type MediaSearchResponse = {
  page: number
  total_pages: number
  total_results: number
  results: MediaSearchResult[]
  filters: {
    q: string
    type: "movie" | "tv" | "all"
    genreIds: number[]
    yearMin?: number
    yearMax?: number
  }
}

type MediaSearchParams = {
  query?: string
  type?: "movie" | "tv" | "all"
  genreIds?: number[]
  yearMin?: number
  yearMax?: number
  page?: number
}

async function searchMedia(params: MediaSearchParams): Promise<MediaSearchResponse> {
  const searchParams = new URLSearchParams()

  if (params.query && params.query.trim().length > 0) {
    searchParams.set("q", params.query.trim())
  }

  if (params.type && params.type !== "all") {
    searchParams.set("type", params.type)
  }

  if (params.genreIds && params.genreIds.length > 0) {
    searchParams.set("genreIds", params.genreIds.join(","))
  }

  if (typeof params.yearMin === "number") {
    searchParams.set("yearMin", String(params.yearMin))
  }

  if (typeof params.yearMax === "number") {
    searchParams.set("yearMax", String(params.yearMax))
  }

  if (typeof params.page === "number" && Number.isFinite(params.page) && params.page > 0) {
    searchParams.set("page", String(params.page))
  }

  const queryString = searchParams.toString()
  const url = queryString.length > 0 ? `/tmdb/search?${queryString}` : "/tmdb/search"

  return apiGet<MediaSearchResponse>(url)
}

export {
  getImageConfig,
  getPosterUrl,
  getPosterUrlSync,
  getBackdropUrlSync,
  getProfileUrlSync,
  fetchMovieList,
  fetchTvList,
  fetchMovieDetail,
  fetchTvDetail,
  fetchMovieGenres,
  fetchTvGenres,
  getGenreNames,
  fetchTvExternalIds,
  searchMedia,
}
export type {
  MovieResultItem,
  TVSeriesResultItem,
  PaginatedResponse,
  MediaSearchResult,
  MediaSearchResponse,
  MediaSearchParams,
}
