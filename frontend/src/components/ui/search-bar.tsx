import * as React from "react"
import { useTranslation } from "react-i18next"
import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

const DEBOUNCE_MS = 350

interface SearchBarProps extends React.ComponentProps<"input"> {
  value?: string
  isDynamicSearch?: boolean
  onDebouncedChange?: (value: string) => void
  onSearch?: (value: string) => void
}

function SearchBar({
  className,
  placeholder,
  value: valueFromUrl,
  isDynamicSearch,
  onDebouncedChange,
  onSearch,
  ...props
}: SearchBarProps) {
  const { t } = useTranslation()
  const resolvedPlaceholder = placeholder ?? t("search.placeholder")
  const [value, setValue] = React.useState(valueFromUrl ?? "")
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    setValue(valueFromUrl ?? "")
  }, [valueFromUrl])

  React.useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const applySearch = React.useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      onSearch?.(trimmed)
    },
    [onSearch],
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value
    setValue(next)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (isDynamicSearch && onDebouncedChange) {
      debounceRef.current = setTimeout(() => onDebouncedChange(next), DEBOUNCE_MS)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    applySearch(value)
  }

  return (
    <form onSubmit={handleSubmit} role="search" className={cn("w-full max-w-xl", className)}>
      <InputGroup
        className={cn(
          "h-11 overflow-hidden rounded-full border-0 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]",
          "focus-within:ring-0 dark:bg-gray-800"
        )}
      >
        <InputGroupInput
          type="search"
          placeholder={resolvedPlaceholder}
          className="placeholder:text-neutral-500"
          {...props}
          value={value}
          onChange={handleChange}
        />
        <InputGroupAddon align="inline-start">
          <Search className="text-neutral-500" />
        </InputGroupAddon>
        <InputGroupAddon align="inline-end" className="cursor-default self-stretch py-1.5 pr-1.5 pl-1">
          <InputGroupButton
            type="submit"
            size="sm"
            className={cn(
              "h-full min-w-[5rem] rounded-full bg-[#222] px-5 text-white shadow-sm mr-2",
              "hover:bg-[#333] focus-visible:ring-[#222] focus-visible:ring-offset-0"
            )}
          >
            {t("search.button")}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

export { SearchBar }
