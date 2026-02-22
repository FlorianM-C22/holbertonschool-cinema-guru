import { useCallback, useEffect, useState } from "react"
import * as tmdbApi from "./api"
import type { MovieCategory, TvCategory } from "./types"
import type { MovieResultItem, PaginatedResponse, TVSeriesResultItem } from "@lorenzopant/tmdb"

type MovieListState = {
  data: PaginatedResponse<MovieResultItem> | null
  isLoading: boolean
  error: Error | null
}

type TvListState = {
  data: PaginatedResponse<TVSeriesResultItem> | null
  isLoading: boolean
  error: Error | null
}

type ImageConfigState = {
  loaded: boolean
  error: Error | null
}

function useImageConfig(): ImageConfigState & { getPosterUrl: (path: string | null | undefined) => string | null } {
  const [state, setState] = useState<ImageConfigState>({ loaded: false, error: null })

  const getPosterUrl = useCallback((posterPath: string | null | undefined): string | null => {
    return tmdbApi.getPosterUrlSync(posterPath)
  }, [])

  useEffect(() => {
    let cancelled = false
    tmdbApi
      .getImageConfig()
      .then(() => {
        if (!cancelled) setState({ loaded: true, error: null })
      })
      .catch((err) => {
        if (!cancelled) setState({ loaded: false, error: err instanceof Error ? err : new Error(String(err)) })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { ...state, getPosterUrl }
}

function useMovieList(category: MovieCategory): MovieListState {
  const [state, setState] = useState<MovieListState>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setState((s) => ({ ...s, isLoading: true, error: null }))
    })
    tmdbApi
      .fetchMovieList(category)
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          })
      })
    return () => {
      cancelled = true
    }
  }, [category])

  return state
}

function useTvList(category: TvCategory): TvListState {
  const [state, setState] = useState<TvListState>({
    data: null,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setState((s) => ({ ...s, isLoading: true, error: null }))
    })
    tmdbApi
      .fetchTvList(category)
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null })
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          })
      })
    return () => {
      cancelled = true
    }
  }, [category])

  return state
}

export { useImageConfig, useMovieList, useTvList }
