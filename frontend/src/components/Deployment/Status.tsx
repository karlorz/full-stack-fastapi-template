import type { DeploymentStatus } from "@/client"
import { Badge } from "@/components/ui/badge"

const STATUS_CONFIG: Record<
  DeploymentStatus,
  {
    text: string
    variant: {
      bg: string
      text: string
      border: string
      dot: string
    }
  }
> = {
  waiting_upload: {
    text: "Waiting Upload",
    variant: {
      bg: "bg-slate-50 dark:bg-slate-950/50",
      text: "text-slate-700 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-800",
      dot: "bg-slate-500",
    },
  },
  ready_for_build: {
    text: "Ready for Build",
    variant: {
      bg: "bg-slate-50 dark:bg-slate-950/50",
      text: "text-slate-700 dark:text-slate-400",
      border: "border-slate-200 dark:border-slate-800",
      dot: "bg-slate-500",
    },
  },
  building: {
    text: "Building",
    variant: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
    },
  },
  extracting: {
    text: "Extracting",
    variant: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
    },
  },
  building_image: {
    text: "Building Image",
    variant: {
      bg: "bg-amber-50 dark:bg-amber-950/50",
      text: "text-amber-700 dark:text-amber-400",
      border: "border-amber-200 dark:border-amber-800",
      dot: "bg-amber-500",
    },
  },
  deploying: {
    text: "Deploying",
    variant: {
      bg: "bg-blue-50 dark:bg-blue-950/50",
      text: "text-blue-700 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500",
    },
  },
  success: {
    text: "Success",
    variant: {
      bg: "bg-green-50 dark:bg-emerald-950/50",
      text: "text-green-700 dark:text-emerald-400",
      border: "border-green-200 dark:border-emerald-800",
      dot: "bg-green-500 dark:bg-emerald-500",
    },
  },
  failed: {
    text: "Failed",
    variant: {
      bg: "bg-red-50 dark:bg-red-950/50",
      text: "text-red-700 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      dot: "bg-red-500",
    },
  },
}

export function Status({ status }: { status: DeploymentStatus | null }) {
  if (!status) {
    return (
      <Badge
        variant="outline"
        className="bg-slate-50 dark:bg-slate-950/50 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800"
      >
        <span className="mr-1 h-2 w-2 rounded-full inline-block bg-slate-500" />
        Not Deployed
      </Badge>
    )
  }

  const config = STATUS_CONFIG[status]
  if (!config) return <span className="text-sm">{status}</span>

  const { variant, text } = config

  return (
    <Badge
      variant="outline"
      className={`${variant.bg} ${variant.text} ${variant.border}`}
    >
      <span
        className={`mr-1 h-2 w-2 rounded-full inline-block ${variant.dot}`}
      />
      {text}
    </Badge>
  )
}
