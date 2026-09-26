import { cn } from "cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-none bg-[#EFECE6]", className)}
      {...props}
    />
  )
}

export { Skeleton }
