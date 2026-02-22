import { cn } from "@/lib/utils"

type PosterCardProps = {
  posterUrl: string | null
  title: string
  voteAverage?: number
  className?: string
}

function PosterCard({ posterUrl, title, voteAverage, className }: PosterCardProps) {
  return (
    <article
      className={cn(
        "group flex w-[10rem] shrink-0 flex-col gap-2 transition-transform duration-200 ease-out hover:scale-[1.03] hover:shadow-lg",
        className
      )}
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted shadow-md">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt=""
            className="h-full w-full object-cover transition-opacity duration-200 group-hover:opacity-95"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/50 text-xs">
            No image
          </div>
        )}
        {voteAverage !== undefined && (
          <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
            {voteAverage.toFixed(1)}
          </span>
        )}
      </div>
      <p className="line-clamp-2 text-sm font-medium text-foreground" title={title}>
        {title}
      </p>
    </article>
  )
}

export { PosterCard }
export type { PosterCardProps }
