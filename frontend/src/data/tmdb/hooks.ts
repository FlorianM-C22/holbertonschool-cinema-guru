import { useCallback, useEffect, useState } from "react"
import * as tmdbApi from "./api"
import type { MovieCategory, TvCategory } from "./types"
import type {
  MovieResultItem,
  PaginatedResponse,
  TVSeriesResultItem,
} from "@lorenzopant/tmdb"
import type { MediaSearchParams, MediaSearchResponse } from "./api"

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

type MediaSearchState = {
  data: MediaSearchResponse | null
  isLoading: boolean
  error: Error | null
}

type ImageConfigState = {
  loaded: boolean
  error: Error | null
}

function useImageConfig(): ImageConfigState & {
  getPosterUrl: (path: string | null | undefined) => string | null
  getBackdropUrl: (path: string | null | undefined) => string | null
  getProfileUrl: (path: string | null | undefined) => string | null
} {
  const [state, setState] = useState<ImageConfigState>({ loaded: false, error: null })

  const getPosterUrl = useCallback((posterPath: string | null | undefined): string | null => {
    return tmdbApi.getPosterUrlSync(posterPath)
  }, [])

  const getBackdropUrl = useCallback((backdropPath: string | null | undefined): string | null => {
    return tmdbApi.getBackdropUrlSync(backdropPath)
  }, [])

  const getProfileUrl = useCallback((profilePath: string | null | undefined): string | null => {
    return tmdbApi.getProfileUrlSync(profilePath)
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

  return { ...state, getPosterUrl, getBackdropUrl, getProfileUrl }
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

type GenresHookResult = {
  getGenreNames: (genreIds: number[], type: "movie" | "tv") => string[]
  loaded: boolean
  movieGenres: { id: number; name: string }[]
  tvGenres: { id: number; name: string }[]
}

function useGenres(): GenresHookResult {
  const [loaded, setLoaded] = useState(false)
  const [movieGenres, setMovieGenres] = useState<{ id: number; name: string }[]>([])
  const [tvGenres, setTvGenres] = useState<{ id: number; name: string }[]>([])

  const getGenreNames = useCallback((genreIds: number[], type: "movie" | "tv") => {
    return tmdbApi.getGenreNames(genreIds, type)
  }, [])

  useEffect(() => {
    let cancelled = false
    Promise.all([tmdbApi.fetchMovieGenres(), tmdbApi.fetchTvGenres()]).then(
      ([movies, tv]) => {
        if (!cancelled) {
          setMovieGenres(movies)
          setTvGenres(tv)
          setLoaded(true)
        }
      },
      () => {
        if (!cancelled) setLoaded(true)
      },
    )
    return () => {
      cancelled = true
    }
  }, [])

  return { getGenreNames, loaded, movieGenres, tvGenres }
}

type LanguagesHookResult = {
  languages: { code: string; label: string }[]
  loaded: boolean
}

function useLanguages(): LanguagesHookResult {
  const [languages, setLanguages] = useState<{ code: string; label: string }[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    tmdbApi
      .fetchLanguages()
      .then(
        (items) => {
          if (cancelled) return
          const mapped = (items ?? [])
            .filter((lang) => typeof lang.iso_639_1 === "string" && lang.iso_639_1.trim().length > 0)
            .map((lang) => ({
              code: lang.iso_639_1,
              label: lang.english_name || lang.name || lang.iso_639_1,
            }))
            .sort((a, b) => a.label.localeCompare(b.label))
          setLanguages(mapped)
          setLoaded(true)
        },
        () => {
          if (!cancelled) setLoaded(true)
        },
      )

    return () => {
      cancelled = true
    }
  }, [])

  return { languages, loaded }
}

function useMediaSearch(params: MediaSearchParams): MediaSearchState {
  const [state, setState] = useState<MediaSearchState>({
    data: null,
    isLoading: false,
    error: null,
  })

  useEffect(() => {
    const hasQuery =
      typeof params.query === "string" && params.query.trim().length > 0
    const hasFilters =
      hasQuery ||
      (Array.isArray(params.genreIds) && params.genreIds.length > 0) ||
      typeof params.yearMin === "number" ||
      typeof params.yearMax === "number"

    if (!hasFilters) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: null,
      }))
      return
    }

    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setState((current) => ({
          ...current,
          isLoading: true,
          error: null,
        }))
      }
    })

    tmdbApi
      .searchMedia(params)
      .then((data) => {
        if (!cancelled) {
          setState({
            data,
            isLoading: false,
            error: null,
          })
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [params.query, params.type, params.genreIds, params.yearMin, params.yearMax, params.originalLanguage, params.page])

  return state
}

export { useImageConfig, useMovieList, useTvList, useGenres, useLanguages, useMediaSearch }
