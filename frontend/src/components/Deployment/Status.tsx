import { Flex, Text } from "@chakra-ui/react"
import Lottie, { type LottieOptions } from "lottie-react"

import building from "@/assets/building.json"
import deploying from "@/assets/deploying.json"
import failed from "@/assets/failed.json"
import success from "@/assets/success.json"
import waiting from "@/assets/waiting.json"
import type { DeploymentStatus } from "@/client"

export function Status({
  deployment: { status },
}: { deployment: { status: DeploymentStatus } }) {
  let animationData: LottieOptions["animationData"]
  let statusText: string
  let loop: boolean
  switch (status) {
    case "waiting_upload":
      animationData = waiting
      statusText = "Waiting Upload"
      loop = true
      break
    case "building":
      animationData = building
      statusText = "Building"
      loop = true
      break
    case "deploying":
      animationData = deploying
      statusText = "Deploying"
      loop = true
      break
    case "success":
      animationData = success
      statusText = "Success"
      loop = false
      break
    case "failed":
      animationData = failed
      statusText = "Failed"
      loop = false
      break
    default:
      return status
  }

  return (
    <Flex alignItems="center" gap={1}>
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={true}
        style={{ width: 20, height: 20 }}
      />
      <Text>{statusText}</Text>
    </Flex>
  )
}
