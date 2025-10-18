
import React, { useState, useRef, useEffect } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "../../lib/utils"

interface Option {
  label: string
  value: string
}

interface SelectProps {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
}) => {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className="truncate">
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 opacity-50 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          ref={menuRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md"
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                "relative flex cursor-pointer select-none items-center rounded-sm py-2 pl-8 pr-2 text-sm hover:bg-accent hover:text-accent-foreground",
                opt.value === value &&
                  "bg-accent text-accent-foreground font-medium"
              )}
            >
              {opt.value === value && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                  <Check className="h-4 w-4" />
                </span>
              )}
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* Extra helper components (stubs, for API parity) */
const SelectGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
)

const SelectValue: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <span>{children}</span>
)

const SelectLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-1.5 pl-2 pr-2 text-sm font-semibold">{children}</div>
)

const SelectSeparator: React.FC = () => (
  <div className="-mx-1 my-1 h-px bg-muted" />
)

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectLabel,
  SelectSeparator,
}
