import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const POSTER_ASPECT_RATIO = "aspect-[2/3]"

function PosterCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-[14rem] shrink-0 flex-col gap-2", className)}>
      <Skeleton className={cn("w-full rounded-lg", POSTER_ASPECT_RATIO)} />
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
