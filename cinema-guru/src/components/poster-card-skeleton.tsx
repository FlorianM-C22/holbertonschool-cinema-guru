import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const POSTER_ASPECT_RATIO = "aspect-[2/3]"

function PosterCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-[10rem] shrink-0 flex-col gap-2", className)}>
      <Skeleton className={cn("w-full rounded-lg", POSTER_ASPECT_RATIO)} />
      <Skeleton className="h-4 w-full rounded" />
      <Skeleton className="h-4 w-3/4 rounded" />
    </div>
  )
}

function CarouselSkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <PosterCardSkeleton key={i} />
      ))}
    </>
  )
}

export { PosterCardSkeleton, CarouselSkeletonRow }
