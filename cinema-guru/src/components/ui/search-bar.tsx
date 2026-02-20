import * as React from "react"
import { Search } from "lucide-react"

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

const SEARCH_PLACEHOLDER = "Search for a movie..."

interface SearchBarProps extends React.ComponentProps<"input"> {
  onSearch?: (value: string) => void
}

function SearchBar({
  className,
  placeholder = SEARCH_PLACEHOLDER,
  onSearch,
  ...props
}: SearchBarProps) {
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(value)
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
          placeholder={placeholder}
          className="placeholder:text-neutral-500"
          {...props}
          value={value}
          onChange={(e) => setValue(e.target.value)}
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
            Search
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </form>
  )
}

export { SearchBar }
