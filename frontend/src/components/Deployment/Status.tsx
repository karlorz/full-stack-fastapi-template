import Lottie, { type LottieOptions } from "lottie-react"

import building from "@/assets/building.json"
import deploying from "@/assets/deploying.json"
import failed from "@/assets/failed.json"
import success from "@/assets/success.json"
import waiting from "@/assets/waiting.json"
import type { DeploymentStatus } from "@/client"

const STATUS_CONFIG: Record<
  DeploymentStatus,
  { animation: LottieOptions["animationData"]; text: string; loop: boolean }
> = {
  waiting_upload: { animation: waiting, text: "Waiting Upload", loop: true },
  ready_for_build: { animation: waiting, text: "Ready for Build", loop: true },
  building: { animation: building, text: "Building", loop: true },
  extracting: { animation: building, text: "Extracting", loop: true },
  building_image: { animation: building, text: "Building Image", loop: true },
  deploying: { animation: deploying, text: "Deploying", loop: true },
  success: { animation: success, text: "Success", loop: false },
  failed: { animation: failed, text: "Failed", loop: false },
}

export function Status({
  deployment: { status },
}: { deployment: { status: DeploymentStatus } }) {
  const config = STATUS_CONFIG[status]
  if (!config) return <span className="text-sm">{status}</span>

  return (
    <div className="flex items-center gap-1">
      <Lottie
        animationData={config.animation}
        loop={config.loop}
        autoplay
        style={{ width: 20, height: 20 }}
      />
      <span className="text-sm">{config.text}</span>
    </div>
  )
}
