import { apiGet } from "@/data/apiClient"
import type { FanartMovieArt, FanartTvArt } from "./types"

const cacheMovie = new Map<number, FanartMovieArt>()
const cacheTv = new Map<number, FanartTvArt>()

export async function fetchMovieArt(tmdbId: number): Promise<FanartMovieArt> {
  const cached = cacheMovie.get(tmdbId)
  if (cached) return cached
  try {
    const result = await apiGet<FanartMovieArt>(`/fanart/movies/${tmdbId}`)
    cacheMovie.set(tmdbId, result)
    return result
  } catch {
    const result: FanartMovieArt = { logoUrl: null, backgroundUrl: null }
    cacheMovie.set(tmdbId, result)
    return result
  }
}

export async function fetchTvArt(tmdbId: number): Promise<FanartTvArt> {
  const cached = cacheTv.get(tmdbId)
  if (cached) return cached
  try {
    const result = await apiGet<FanartTvArt>(`/fanart/tv/${tmdbId}`)
    cacheTv.set(tmdbId, result)
    return result
  } catch {
    const result: FanartTvArt = { logoUrl: null, backgroundUrl: null }
    cacheTv.set(tmdbId, result)
    return result
  }
}

export function isCached(tmdbId: number, mediaType: "movie" | "tv"): boolean {
  return mediaType === "movie" ? cacheMovie.has(tmdbId) : cacheTv.has(tmdbId)
}

/** Fire-and-forget prefetch; fills the module cache. */
export function prefetchFanart(tmdbId: number, mediaType: "movie" | "tv"): void {
  if (mediaType === "movie") {
    fetchMovieArt(tmdbId).catch(() => {})
  } else {
    fetchTvArt(tmdbId).catch(() => {})
  }
}
