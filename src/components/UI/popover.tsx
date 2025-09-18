import * as React from "react"

// Simple popover hook for managing open/close state
const usePopover = (initialOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(initialOpen)
  const toggle = () => setIsOpen(!isOpen)
  const open = () => setIsOpen(true)
  const close = () => setIsOpen(false)
  
  return { isOpen, toggle, open, close, setIsOpen }
}

interface PopoverProps {
  children: React.ReactNode
}

interface PopoverTriggerProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}

interface PopoverContentProps {
  children: React.ReactNode
  className?: string
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

const PopoverContext = React.createContext<{
  isOpen: boolean
  toggle: () => void
  close: () => void
  triggerRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
} | null>(null)

const Popover: React.FC<PopoverProps> = ({ children }) => {
  const { isOpen, toggle, close } = usePopover()
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        triggerRef.current &&
        contentRef.current &&
        !triggerRef.current.contains(event.target as Node) &&
        !contentRef.current.contains(event.target as Node)
      ) {
        close()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, close])

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        close()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, close])

  return (
    <PopoverContext.Provider value={{ isOpen, toggle, close, triggerRef, contentRef }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ children, onClick, className, ...props }) => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverTrigger must be used within a Popover')

  const handleClick = () => {
    context.toggle()
    onClick?.()
  }

  return (
    <button
      ref={context.triggerRef}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
}

const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  ...props 
}) => {
  const context = React.useContext(PopoverContext)
  if (!context) throw new Error('PopoverContent must be used within a Popover')

  if (!context.isOpen) return null

  const getPositionStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      zIndex: 50,
      width: '288px', // w-72
      backgroundColor: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '16px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      outline: 'none'
    }

    switch (side) {
      case 'top':
        return {
          ...baseStyles,
          bottom: `calc(100% + ${sideOffset}px)`,
          left: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          right: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateX(-50%)' : undefined
        }
      case 'bottom':
        return {
          ...baseStyles,
          top: `calc(100% + ${sideOffset}px)`,
          left: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          right: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateX(-50%)' : undefined
        }
      case 'left':
        return {
          ...baseStyles,
          right: `calc(100% + ${sideOffset}px)`,
          top: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          bottom: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateY(-50%)' : undefined
        }
      case 'right':
        return {
          ...baseStyles,
          left: `calc(100% + ${sideOffset}px)`,
          top: align === 'start' ? '0' : align === 'end' ? 'auto' : '50%',
          bottom: align === 'end' ? '0' : 'auto',
          transform: align === 'center' ? 'translateY(-50%)' : undefined
        }
      default:
        return baseStyles
    }
  }

  return (
    <div
      ref={context.contentRef}
      style={getPositionStyles()}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverContent }