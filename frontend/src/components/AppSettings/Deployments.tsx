import { Flex, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import Lottie, { type LottieOptions } from "lottie-react"

import building from "../../assets/building.json"
import deploying from "../../assets/deploying.json"
import failed from "../../assets/failed.json"
import success from "../../assets/success.json"
import waiting from "../../assets/waiting.json"
import { type DeploymentStatus, DeploymentsService } from "../../client"

const Deployments = ({ appId }: { appId: string }) => {
  const headers = ["Deployment ID", "Status", "Created At"]

  const { data: deployments } = useSuspenseQuery({
    queryKey: ["deployments", appId],
    queryFn: () => DeploymentsService.readDeployments({ appId }),
  })

  const getStatusAnimation = (status: DeploymentStatus) => {
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
      <>
        <Flex alignItems="center" gap={1}>
          <Lottie
            animationData={animationData}
            loop={loop}
            autoplay={true}
            style={{ width: 20, height: 20 }}
          />
          <Text>{statusText}</Text>
        </Flex>
      </>
    )
  }

  return (
    <>
      {deployments && deployments.data.length > 0 ? (
        <Table variant="simple" mt="4">
          <Thead>
            <Tr>
              {headers.map((header) => (
                <Th key={header} textTransform="capitalize">
                  {header}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {deployments.data.map((deployment) => (
              <Tr key={deployment.id}>
                <Td>{deployment.id}</Td>
                <Td>{getStatusAnimation(deployment.status)}</Td>
                <Td>{new Date(deployment.created_at).toLocaleString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <Text>No deployments available</Text>
      )}
    </>
  )
}

export default Deployments
