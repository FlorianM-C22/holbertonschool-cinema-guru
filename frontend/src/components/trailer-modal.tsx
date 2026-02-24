import { useEffect, useState, type MouseEvent } from "react"
import { X } from "lucide-react"
import { useMediaDetails } from "@/data/media/hooks"
import { useImageConfig } from "@/data/tmdb/hooks"

type TrailerModalProps = {
  isOpen: boolean
  onClose: () => void
  tmdbId: number | null
  mediaType: "movie" | "tv"
}

function TrailerModal({ isOpen, onClose, tmdbId, mediaType }: TrailerModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const { getProfileUrl } = useImageConfig()
  const { data, loading, error } = useMediaDetails(
    isOpen && tmdbId != null ? tmdbId : null,
    mediaType,
  )

  useEffect(() => {
    if (isOpen) {
      const id = requestAnimationFrame(() => setIsVisible(true))
      return () => cancelAnimationFrame(id)
    }
    const id = requestAnimationFrame(() => setIsVisible(false))
    return () => cancelAnimationFrame(id)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || tmdbId == null) return null

  const overlayClassName = [
    "fixed inset-0 z-50 flex items-center justify-center bg-black/70 transition-opacity duration-300",
    isVisible ? "opacity-100" : "opacity-0",
  ].join(" ")

  const panelClassName = [
    "relative z-50 flex max-h-[85vh] w-full max-w-2xl flex-col transform overflow-hidden rounded-lg bg-background text-foreground shadow-2xl transition-all duration-300 ease-out",
    isVisible ? "scale-100 translate-y-0 opacity-100" : "scale-95 translate-y-4 opacity-0",
  ].join(" ")

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const trailer = data?.trailer
  const details = data?.tmdb

  return (
    <div className={overlayClassName} onClick={handleOverlayClick} aria-modal="true" role="dialog">
      <div className={panelClassName}>
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto scroll-y-invisible">
          <div className="aspect-video w-full shrink-0 bg-black">
            {trailer?.youtubeVideoId ? (
              <iframe
                title={trailer.title ?? "Trailer"}
                src={`https://www.youtube.com/embed/${trailer.youtubeVideoId}`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Aucun trailer disponible
              </div>
            )}
          </div>

          <div className="space-y-3 px-4 pb-4 pt-1">
            {loading && (
              <p className="text-sm text-muted-foreground">Chargement des informations…</p>
            )}

            {error && !loading && (
              <p className="text-sm text-destructive">
                Impossible de charger les informations du titre.
              </p>
            )}

            {details && !loading && !error && (
              <>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-xl font-semibold">{details.title}</h2>
                  {details.rating != null && (
                    <span className="text-sm font-medium text-muted-foreground">
                      {details.rating.toFixed(1)}/10
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {details.releaseDate && (
                    <span>{new Date(details.releaseDate).getFullYear()}</span>
                  )}
                  {details.genres.length > 0 && (
                    <span>{details.genres.slice(0, 4).join(", ")}</span>
                  )}
                  {details.runtime != null && details.runtime > 0 && (
                    <span>{details.runtime} min</span>
                  )}
                  {details.numberOfSeasons != null && details.numberOfSeasons > 0 && (
                    <span>{details.numberOfSeasons} saison{details.numberOfSeasons > 1 ? "s" : ""}</span>
                  )}
                </div>

                {details.tagline && (
                  <p className="text-sm italic text-muted-foreground">{details.tagline}</p>
                )}

                {details.overview && (
                  <p className="text-sm text-muted-foreground">{details.overview}</p>
                )}

                {details.cast.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Casting principal</h3>
                    <ul className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-3 md:grid-cols-4">
                      {details.cast.map((person) => {
                        const profileUrl = getProfileUrl(person.profilePath)
                        return (
                          <li key={person.id} className="flex flex-col items-center gap-1 text-center">
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                              {profileUrl ? (
                                <img
                                  src={profileUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-muted-foreground/50 text-lg font-medium">
                                  {person.name.slice(0, 1)}
                                </div>
                              )}
                            </div>
                            <span className="font-medium">{person.name}</span>
                            {person.character && (
                              <span className="text-muted-foreground">{person.character}</span>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export { TrailerModal }
export type { TrailerModalProps }

