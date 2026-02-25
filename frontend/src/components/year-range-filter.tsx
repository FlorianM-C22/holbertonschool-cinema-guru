import { useMemo } from "react"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"

type YearRangeFilterProps = {
  minYear: number
  maxYear: number
  value: [number, number]
  onChange: (value: [number, number]) => void
}

function clampYear(value: number, minYear: number, maxYear: number): number {
  if (Number.isNaN(value)) return minYear
  if (value < minYear) return minYear
  if (value > maxYear) return maxYear
  return value
}

function YearRangeFilter({ minYear, maxYear, value, onChange }: YearRangeFilterProps) {
  const [currentMin, currentMax] = useMemo(() => {
    const safeMin = clampYear(value[0], minYear, maxYear)
    const safeMax = clampYear(value[1], minYear, maxYear)
    if (safeMin > safeMax) {
      return [safeMin, safeMin]
    }
    return [safeMin, safeMax]
  }, [value, minYear, maxYear])

  const handleSliderChange = (next: number[]) => {
    if (next.length !== 2) return
    const [nextMin, nextMax] = next as [number, number]
    onChange([clampYear(nextMin, minYear, maxYear), clampYear(nextMax, minYear, maxYear)])
  }

  const handleMinChange = (raw: string) => {
    const parsed = parseInt(raw, 10)
    const nextMin = clampYear(Number.isNaN(parsed) ? minYear : parsed, minYear, maxYear)
    const constrained = nextMin > currentMax ? nextMin : currentMax
    onChange([nextMin, constrained])
  }

  const handleMaxChange = (raw: string) => {
    const parsed = parseInt(raw, 10)
    const nextMax = clampYear(Number.isNaN(parsed) ? maxYear : parsed, minYear, maxYear)
    const constrained = nextMax < currentMin ? nextMax : currentMin
    onChange([constrained, nextMax])
  }

  return (
    <div className="space-y-3">
      <Slider
        min={minYear}
        max={maxYear}
        step={1}
        value={[currentMin, currentMax]}
        onValueChange={handleSliderChange}
      />
      <div className="flex items-center gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-muted-foreground">From</span>
          <Input
            type="number"
            inputMode="numeric"
            value={currentMin}
            onChange={(event) => handleMinChange(event.target.value)}
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <span className="text-xs text-muted-foreground">To</span>
          <Input
            type="number"
            inputMode="numeric"
            value={currentMax}
            onChange={(event) => handleMaxChange(event.target.value)}
          />
        </div>
      </div>
    </div>
  )
}

export { YearRangeFilter }

