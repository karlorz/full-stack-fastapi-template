import type { VariantProps } from "class-variance-authority"
import type * as React from "react"
import { cn } from "@/lib/utils"
import { Badge, badgeVariants } from "./badge"

export type StatusType =
  | "idle"
  | "pending"
  | "processing"
  | "success"
  | "error"
  | "warning"

type BadgeVariant = VariantProps<typeof badgeVariants>["variant"]

const statusConfig: Record<
  StatusType,
  {
    variant: BadgeVariant
    dotClass: string
  }
> = {
  idle: {
    variant: "outline",
    dotClass: "bg-gray-500",
  },
  pending: {
    variant: "muted",
    dotClass: "bg-gray-500",
  },
  processing: {
    variant: "warning",
    dotClass: "bg-amber-500",
  },
  success: {
    variant: "success",
    dotClass: "bg-green-500",
  },
  error: {
    variant: "destructive",
    dotClass: "bg-red-500",
  },
  warning: {
    variant: "warning",
    dotClass: "bg-amber-500",
  },
}

interface StatusBadgeProps
  extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  status: StatusType
  showDot?: boolean
  children?: React.ReactNode
}

export function StatusBadge({
  status,
  showDot = true,
  children,
  className,
  ...props
}: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant={config.variant} className={cn(className)} {...props}>
      {showDot && (
        <span className={cn("h-2 w-2 rounded-full", config.dotClass)} />
      )}
      {children}
    </Badge>
  )
}
