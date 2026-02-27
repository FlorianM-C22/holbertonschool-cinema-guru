import { apiGet } from "@/data/apiClient"
import type { FanartMovieArt, FanartTvArt } from "./types"

const cacheMovie = new Map<string, FanartMovieArt>()
const cacheTv = new Map<string, FanartTvArt>()

function cacheKey(id: number, language: string): string {
  return `${id}:${language}`
}

export async function fetchMovieArt(
  tmdbId: number,
  options?: { language?: string },
): Promise<FanartMovieArt> {
  const language = options?.language ?? "en"
  const key = cacheKey(tmdbId, language)
  const cached = cacheMovie.get(key)
  if (cached) return cached
  try {
    const result = await apiGet<FanartMovieArt>(
      `/fanart/movies/${tmdbId}?language=${encodeURIComponent(language)}`,
    )
    cacheMovie.set(key, result)
    return result
  } catch {
    const result: FanartMovieArt = { logoUrl: null, backgroundUrl: null }
    cacheMovie.set(key, result)
    return result
  }
}

export async function fetchTvArt(
  tmdbId: number,
  options?: { language?: string },
): Promise<FanartTvArt> {
  const language = options?.language ?? "en"
  const key = cacheKey(tmdbId, language)
  const cached = cacheTv.get(key)
  if (cached) return cached
  try {
    const result = await apiGet<FanartTvArt>(
      `/fanart/tv/${tmdbId}?language=${encodeURIComponent(language)}`,
    )
    cacheTv.set(key, result)
    return result
  } catch {
    const result: FanartTvArt = { logoUrl: null, backgroundUrl: null }
    cacheTv.set(key, result)
    return result
  }
}

export function isCached(
  tmdbId: number,
  mediaType: "movie" | "tv",
  language?: string,
): boolean {
  const lang = language ?? "en"
  const key = cacheKey(tmdbId, lang)
  return mediaType === "movie" ? cacheMovie.has(key) : cacheTv.has(key)
}

/** Fire-and-forget prefetch; fills the module cache. */
export function prefetchFanart(
  tmdbId: number,
  mediaType: "movie" | "tv",
  options?: { language?: string },
): void {
  if (mediaType === "movie") {
    fetchMovieArt(tmdbId, options).catch(() => {})
  } else {
    fetchTvArt(tmdbId, options).catch(() => {})
  }
}
