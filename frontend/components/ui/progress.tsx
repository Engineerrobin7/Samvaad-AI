import * as React from "react"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  className?: string
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ value = 0, className = "", ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-primary/20 ${className}`}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
        style={{ transform: `translateX(-${100 - value}%)` }}
      />
    </div>
  )
)

Progress.displayName = "Progress"