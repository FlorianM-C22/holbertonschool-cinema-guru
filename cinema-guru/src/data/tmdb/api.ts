import { getTMDB } from "./client"
import type { MovieCategory, TvCategory } from "./types"
import type {
  ConfigurationResponse,
  MovieResultItem,
  PaginatedResponse,
  TVSeriesResultItem,
} from "@lorenzopant/tmdb"

const POSTER_SIZE = "w342"

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

export {
  getImageConfig,
  getPosterUrl,
  getPosterUrlSync,
  fetchMovieList,
  fetchTvList,
}
export type { MovieResultItem, TVSeriesResultItem, PaginatedResponse }
