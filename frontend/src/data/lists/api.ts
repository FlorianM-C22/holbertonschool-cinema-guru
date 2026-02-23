import { apiDelete, apiGet, apiPost } from "@/data/apiClient"

export type ListEntry = { tmdbId: number; mediaType: "movie" | "tv" }

export async function getFavorites(): Promise<ListEntry[]> {
  return apiGet<ListEntry[]>("/me/favorites")
}

export async function getWatchLater(): Promise<ListEntry[]> {
  return apiGet<ListEntry[]>("/me/watch-later")
}

export async function addFavorite(tmdbId: number, mediaType: "movie" | "tv"): Promise<unknown> {
  return apiPost("/me/favorites", { tmdbId, mediaType })
}

export async function addWatchLater(tmdbId: number, mediaType: "movie" | "tv"): Promise<unknown> {
  return apiPost("/me/watch-later", { tmdbId, mediaType })
}

export async function removeFavorite(tmdbId: number): Promise<{ deleted: boolean }> {
  return apiDelete<{ deleted: boolean }>(`/me/favorites/${tmdbId}`)
}

export async function removeWatchLater(tmdbId: number): Promise<{ deleted: boolean }> {
  return apiDelete<{ deleted: boolean }>(`/me/watch-later/${tmdbId}`)
}
