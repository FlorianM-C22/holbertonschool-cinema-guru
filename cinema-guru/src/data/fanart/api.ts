import { fetchTvExternalIds } from "@/data/tmdb/api"
import type {
  FanartMovieArt,
  FanartMovieResponse,
  FanartTvArt,
  FanartTvResponse,
} from "./types"

const FANART_ORIGIN = "https://webservice.fanart.tv"
const FANART_PATH = "/v3"
const ENV_API_KEY = "VITE_FANART_TV_API_KEY"
const ENV_CLIENT_KEY = "VITE_FANART_TV_CLIENT_KEY"

const cacheMovie = new Map<number, FanartMovieArt>()
const cacheTv = new Map<number, FanartTvArt>()

function getApiKey(): string | null {
  const key = import.meta.env[ENV_API_KEY]
  if (!key || typeof key !== "string") return null
  return key
}

function getClientKey(): string | null {
  const key = import.meta.env[ENV_CLIENT_KEY]
  if (!key || typeof key !== "string") return null
  return key
}

function buildFanartUrl(path: string, apiKey: string): string {
  const clientKey = getClientKey()
  const params = new URLSearchParams({ api_key: apiKey })
  if (clientKey) params.set("client_key", clientKey)
  const base = typeof window !== "undefined" ? "/fanart-api" : FANART_ORIGIN
  return `${base}${path}?${params.toString()}`
}

function pickBestUrl(
  items: { url: string; likes: string }[] | undefined,
): string | null {
  if (!items?.length) return null
  const sorted = [...items].sort((a, b) => Number(b.likes) - Number(a.likes))
  return sorted[0]?.url ?? null
}

export async function fetchMovieArt(tmdbId: number): Promise<FanartMovieArt> {
  const cached = cacheMovie.get(tmdbId)
  if (cached) return cached

  const apiKey = getApiKey()
  if (!apiKey) {
    const result: FanartMovieArt = { logoUrl: null, backgroundUrl: null }
    cacheMovie.set(tmdbId, result)
    return result
  }
  const url = buildFanartUrl(`${FANART_PATH}/movies/${tmdbId}`, apiKey)
  let result: FanartMovieArt = { logoUrl: null, backgroundUrl: null }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      cacheMovie.set(tmdbId, result)
      return result
    }
    const data = (await res.json()) as FanartMovieResponse
    result = {
      logoUrl: pickBestUrl(data.hdmovielogo),
      backgroundUrl: pickBestUrl(data.moviebackground),
    }
  } catch {
    // leave result as nulls
  }
  cacheMovie.set(tmdbId, result)
  return result
}

/**
 * Fanart.tv uses TVDB id for TV series, not TMDB id. We resolve TMDB -> TVDB via TMDB external_ids.
 */
export async function fetchTvArt(tmdbId: number): Promise<FanartTvArt> {
  const cached = cacheTv.get(tmdbId)
  if (cached) return cached

  const apiKey = getApiKey()
  if (!apiKey) {
    const result: FanartTvArt = { logoUrl: null, backgroundUrl: null }
    cacheTv.set(tmdbId, result)
    return result
  }

  const tvdbId = await fetchTvExternalIds(tmdbId)
  const fanartId = tvdbId ?? tmdbId

  const url = buildFanartUrl(`${FANART_PATH}/tv/${fanartId}`, apiKey)
  let result: FanartTvArt = { logoUrl: null, backgroundUrl: null }

  try {
    const res = await fetch(url)
    if (!res.ok) {
      cacheTv.set(tmdbId, result)
      return result
    }
    const data = (await res.json()) as FanartTvResponse
    const logoUrl = pickBestUrl(data.hdtvlogo) ?? pickBestUrl(data.clearlogo)
    result = {
      logoUrl,
      backgroundUrl: pickBestUrl(data.showbackground),
    }
  } catch {
    // leave result as nulls
  }
  cacheTv.set(tmdbId, result)
  return result
}
