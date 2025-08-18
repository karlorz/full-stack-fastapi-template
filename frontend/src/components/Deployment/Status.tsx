import type { DeploymentStatus } from "@/client"
import { StatusBadge, type StatusType } from "@/components/ui/status-badge"

const STATUS: Record<
  DeploymentStatus,
  {
    text: string
    statusType: StatusType
  }
> = {
  waiting_upload: {
    text: "Waiting Upload",
    statusType: "pending",
  },
  ready_for_build: {
    text: "Ready for Build",
    statusType: "pending",
  },
  building: {
    text: "Building",
    statusType: "processing",
  },
  extracting: {
    text: "Extracting",
    statusType: "processing",
  },
  building_image: {
    text: "Building Image",
    statusType: "processing",
  },
  deploying: {
    text: "Deploying",
    statusType: "processing",
  },
  success: {
    text: "Success",
    statusType: "success",
  },
  failed: {
    text: "Failed",
    statusType: "error",
  },
}

export function Status({ status }: { status: DeploymentStatus | null }) {
  if (!status) {
    return <StatusBadge status="idle">Not Deployed</StatusBadge>
  }

  const config = STATUS[status]
  if (!config) return <span className="text-sm">{status}</span>

  return <StatusBadge status={config.statusType}>{config.text}</StatusBadge>
}
