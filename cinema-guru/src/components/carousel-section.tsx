import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const SCROLL_OFFSET_PX = 380

type CarouselSectionProps = {
  title: string
  children: React.ReactNode
  className?: string
  /** When true, the scroll area extends to the right into the container padding (e.g. -mr-4). */
  fullBleedRight?: boolean
}

function CarouselSection({ title, children, className, fullBleedRight }: CarouselSectionProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const [showArrows, setShowArrows] = React.useState(false)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(
      el.scrollLeft < el.scrollWidth - el.clientWidth - 1
    )
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener("scroll", updateScrollState)
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState, children])

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const amount = direction === "left" ? -SCROLL_OFFSET_PX : SCROLL_OFFSET_PX
    el.scrollBy({ left: amount, behavior: "smooth" })
  }

  return (
    <section
      className={cn(
        "group/carousel relative w-full",
        fullBleedRight && "mr-[-1rem]",
        className,
      )}
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <h2 className="mb-3 text-lg font-semibold text-foreground">{title}</h2>
      <div className="relative">
        <div
          ref={scrollRef}
          className="carousel-scroll flex gap-4 pb-2 pl-6 scroll-smooth"
        >
          {children}
        </div>
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scroll("left")}
          className={cn(
            "absolute left-0 top-0 z-10 flex h-full w-12 items-center justify-center rounded-r-lg bg-gradient-to-r from-background/80 to-transparent text-foreground transition-opacity duration-200",
            "hover:from-background/95 hover:to-transparent",
            showArrows && canScrollLeft
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft className="h-8 w-8 shrink-0" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scroll("right")}
          className={cn(
            "absolute right-0 top-0 z-10 flex h-full w-12 items-center justify-center rounded-l-lg bg-gradient-to-l from-background/80 to-transparent text-foreground transition-opacity duration-200",
            "hover:from-background/95 hover:to-transparent",
            showArrows && canScrollRight
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronRight className="h-8 w-8 shrink-0" strokeWidth={2.5} />
        </button>
      </div>
    </section>
  )
}

export { CarouselSection }
export type { CarouselSectionProps }
