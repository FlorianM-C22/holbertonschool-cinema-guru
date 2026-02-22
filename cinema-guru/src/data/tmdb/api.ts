import { getAccessToken, getTMDB } from "./client"
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
  const tmdb = getTMDB()
  const config = await tmdb.config.get()
  cachedConfig = config
  return config
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
  const tmdb = getTMDB()
  switch (category) {
    case "popular":
      return tmdb.movie_lists.popular(params)
    case "upcoming":
      return tmdb.movie_lists.upcoming(params)
    case "top_rated":
      return tmdb.movie_lists.top_rated(params)
    default:
      return tmdb.movie_lists.popular(params)
  }
}

async function fetchTvList(
  category: TvCategory,
  params?: { page?: number }
): Promise<PaginatedResponse<TVSeriesResultItem>> {
  const tmdb = getTMDB()
  switch (category) {
    case "popular":
      return tmdb.tv_lists.popular(params)
    case "upcoming":
      return tmdb.tv_lists.on_the_air(params)
    case "top_rated":
      return tmdb.tv_lists.top_rated(params)
    default:
      return tmdb.tv_lists.popular(params)
  }
}

type Genre = { id: number; name: string }
let cachedMovieGenres: Genre[] | null = null
let cachedTvGenres: Genre[] | null = null

async function fetchMovieGenres(): Promise<Genre[]> {
  if (cachedMovieGenres) return cachedMovieGenres
  const tmdb = getTMDB()
  const res = await tmdb.genres.movie_list()
  cachedMovieGenres = res.genres ?? []
  return cachedMovieGenres
}

async function fetchTvGenres(): Promise<Genre[]> {
  if (cachedTvGenres) return cachedTvGenres
  const tmdb = getTMDB()
  const res = await tmdb.genres.tv_list()
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

const TMDB_BASE = "https://api.themoviedb.org/3"
const cacheTvExternalIds = new Map<number, number | null>()

async function fetchTvExternalIds(tmdbId: number): Promise<number | null> {
  const cached = cacheTvExternalIds.get(tmdbId)
  if (cached !== undefined) return cached
  try {
    const token = getAccessToken()
    const res = await fetch(`${TMDB_BASE}/tv/${tmdbId}/external_ids`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      cacheTvExternalIds.set(tmdbId, null)
      return null
    }
    const data = (await res.json()) as { tvdb_id?: number }
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
