import { useEffect } from "react"
import * as fanartApi from "./api"
import { runWithConcurrency } from "@/lib/preload/scheduler"

const DEFAULT_MAX_ITEMS = 12
const DEFAULT_CONCURRENCY = 3

type Item = { id: number; mediaType: "movie" | "tv" }

export function usePrefetchFanart(
  items: Item[],
  options?: { maxItems?: number; concurrency?: number }
): void {
  const maxItems = options?.maxItems ?? DEFAULT_MAX_ITEMS
  const concurrency = options?.concurrency ?? DEFAULT_CONCURRENCY

  useEffect(() => {
    if (items.length === 0) return
    const schedule = () => {
      const tasks: (() => Promise<void>)[] = []
      let count = 0
      for (const item of items) {
        if (count >= maxItems) break
        if (fanartApi.isCached(item.id, item.mediaType)) continue
        count += 1
        tasks.push(() =>
          (item.mediaType === "movie"
            ? fanartApi.fetchMovieArt(item.id)
            : fanartApi.fetchTvArt(item.id)
          ).then(() => {})
        )
      }
      if (tasks.length > 0) runWithConcurrency(tasks, concurrency)
    }
    const id =
      typeof requestIdleCallback !== "undefined"
        ? requestIdleCallback(schedule, { timeout: 500 })
        : setTimeout(schedule, 300)
    return () => {
      if (typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(id as number)
      } else {
        clearTimeout(id as number)
      }
    }
  }, [items, maxItems, concurrency])
}
