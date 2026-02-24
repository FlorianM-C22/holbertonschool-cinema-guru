import { useEffect, useState } from "react"
import { apiGet } from "@/data/apiClient"

const DEFAULT_MEDIA_LANGUAGE = "en"

type CastMember = {
  id: number
  name: string
  character: string
  profilePath: string | null
}

type TrailerInfo = {
  youtubeVideoId: string | null
  title: string | null
  thumbnail: string | null
  language: string | null
} | null

type TmdbDetails = {
  id: number
  title: string
  rating: number | null
  overview: string
  releaseDate: string | null
  genres: string[]
  runtime: number | null
  tagline: string | null
  numberOfSeasons: number | null
  cast: CastMember[]
}

export type MediaDetailsResponse = {
  trailer: TrailerInfo
  tmdb: TmdbDetails
}

type MediaDetailsState = {
  data: MediaDetailsResponse | null
  loading: boolean
  error: Error | null
}

export function useMediaDetails(
  tmdbId: number | null,
  mediaType: "movie" | "tv",
  language: string = DEFAULT_MEDIA_LANGUAGE,
): MediaDetailsState {
  const [state, setState] = useState<MediaDetailsState>({
    data: null,
    loading: false,
    error: null,
  })

  useEffect(() => {
    if (tmdbId == null) return

    let isCancelled = false
    let loadingId = 0

    loadingId = requestAnimationFrame(() => {
      if (!isCancelled) {
        setState((prev) => ({ ...prev, loading: true, error: null }))
      }
    })

    apiGet<MediaDetailsResponse>(`/media/${tmdbId}?type=${mediaType}&language=${language}`)
      .then((data) => {
        if (isCancelled) return
        setState({
          data,
          loading: false,
          error: null,
        })
      })
      .catch((error) => {
        if (isCancelled) return
        setState({
          data: null,
          loading: false,
          error: error as Error,
        })
      })

    return () => {
      isCancelled = true
      if (loadingId) cancelAnimationFrame(loadingId)
    }
  }, [tmdbId, mediaType, language])

  return state
}

