import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useAuth } from "@/data/auth/context"
import * as listsApi from "./api"

function key(tmdbId: number, mediaType: "movie" | "tv") {
  return `${tmdbId}-${mediaType}`
}

interface ListsContextValue {
  favoritesSet: Set<string>
  watchLaterSet: Set<string>
  favoritesVersion: number
  watchLaterVersion: number
  isLoading: boolean
  isFavorite: (tmdbId: number, mediaType: "movie" | "tv") => boolean
  isWatchLater: (tmdbId: number, mediaType: "movie" | "tv") => boolean
  toggleFavorite: (tmdbId: number, mediaType: "movie" | "tv") => Promise<void>
  toggleWatchLater: (tmdbId: number, mediaType: "movie" | "tv") => Promise<void>
  refresh: () => Promise<void>
}

const ListsContext = createContext<ListsContextValue | null>(null)

function ListsProvider({ children }: { children: ReactNode }) {
  const { isLoggedIn } = useAuth()
  const [favoritesSet, setFavoritesSet] = useState<Set<string>>(new Set())
  const [watchLaterSet, setWatchLaterSet] = useState<Set<string>>(new Set())
  const [favoritesVersion, setFavoritesVersion] = useState(0)
  const [watchLaterVersion, setWatchLaterVersion] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const favoritesSetRef = useRef(favoritesSet)
  const watchLaterSetRef = useRef(watchLaterSet)
  favoritesSetRef.current = favoritesSet
  watchLaterSetRef.current = watchLaterSet

  const refresh = useCallback(async () => {
    if (!isLoggedIn) {
      setFavoritesSet(new Set())
      setWatchLaterSet(new Set())
      return
    }
    setIsLoading(true)
    try {
      const [favs, wl] = await Promise.all([
        listsApi.getFavorites(),
        listsApi.getWatchLater(),
      ])
      setFavoritesSet(new Set(favs.map((e) => key(e.tmdbId, e.mediaType))))
      setWatchLaterSet(new Set(wl.map((e) => key(e.tmdbId, e.mediaType))))
    } catch {
      setFavoritesSet(new Set())
      setWatchLaterSet(new Set())
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    refresh()
  }, [refresh])

  const isFavorite = useCallback(
    (tmdbId: number, mediaType: "movie" | "tv") =>
      favoritesSet.has(key(tmdbId, mediaType)),
    [favoritesSet]
  )

  const isWatchLater = useCallback(
    (tmdbId: number, mediaType: "movie" | "tv") =>
      watchLaterSet.has(key(tmdbId, mediaType)),
    [watchLaterSet]
  )

  const toggleFavorite = useCallback(
    async (tmdbId: number, mediaType: "movie" | "tv") => {
      const k = key(tmdbId, mediaType)
      const inList = favoritesSetRef.current.has(k)
      if (inList) {
        setFavoritesSet((prev) => {
          const next = new Set(prev)
          next.delete(k)
          return next
        })
        setFavoritesVersion((v) => v + 1)
        try {
          await listsApi.removeFavorite(tmdbId)
        } catch {
          setFavoritesSet((prev) => new Set(prev).add(k))
          setFavoritesVersion((v) => v + 1)
        }
      } else {
        setFavoritesSet((prev) => new Set(prev).add(k))
        setFavoritesVersion((v) => v + 1)
        try {
          await listsApi.addFavorite(tmdbId, mediaType)
        } catch {
          setFavoritesSet((prev) => {
            const next = new Set(prev)
            next.delete(k)
            return next
          })
          setFavoritesVersion((v) => v + 1)
        }
      }
    },
    []
  )

  const toggleWatchLater = useCallback(
    async (tmdbId: number, mediaType: "movie" | "tv") => {
      const k = key(tmdbId, mediaType)
      const inList = watchLaterSetRef.current.has(k)
      if (inList) {
        setWatchLaterSet((prev) => {
          const next = new Set(prev)
          next.delete(k)
          return next
        })
        setWatchLaterVersion((v) => v + 1)
        try {
          await listsApi.removeWatchLater(tmdbId)
        } catch {
          setWatchLaterSet((prev) => new Set(prev).add(k))
          setWatchLaterVersion((v) => v + 1)
        }
      } else {
        setWatchLaterSet((prev) => new Set(prev).add(k))
        setWatchLaterVersion((v) => v + 1)
        try {
          await listsApi.addWatchLater(tmdbId, mediaType)
        } catch {
          setWatchLaterSet((prev) => {
            const next = new Set(prev)
            next.delete(k)
            return next
          })
          setWatchLaterVersion((v) => v + 1)
        }
      }
    },
    []
  )

  const value = useMemo<ListsContextValue>(
    () => ({
      favoritesSet,
      watchLaterSet,
      favoritesVersion,
      watchLaterVersion,
      isLoading,
      isFavorite,
      isWatchLater,
      toggleFavorite,
      toggleWatchLater,
      refresh,
    }),
    [
      favoritesSet,
      watchLaterSet,
      favoritesVersion,
      watchLaterVersion,
      isLoading,
      isFavorite,
      isWatchLater,
      toggleFavorite,
      toggleWatchLater,
      refresh,
    ]
  )

  return (
    <ListsContext.Provider value={value}>{children}</ListsContext.Provider>
  )
}

function useLists(): ListsContextValue {
  const ctx = useContext(ListsContext)
  if (ctx == null) {
    throw new Error("useLists must be used within ListsProvider")
  }
  return ctx
}

export { ListsProvider, useLists }
