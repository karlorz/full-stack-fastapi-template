import { Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"

import { type DeploymentStatus, DeploymentsService } from "../../client"
const Deployments = ({ appId }: { appId: string }) => {
  const headers = ["Deployment ID", "Status", "Created At"]

  const { data: deployments } = useSuspenseQuery({
    queryKey: ["deployments", appId],
    queryFn: () => DeploymentsService.readDeployments({ appId }),
  })

  const getStatusText = (status: DeploymentStatus) => {
    // TODO: Replace the emojis with animated icons
    switch (status) {
      case "waiting_upload":
        return "⏳ Waiting Upload"
      case "building":
        return "🚧 Building"
      case "deploying":
        return "🚀 Deploying"
      case "success":
        return "✔️ Success"
      case "failed":
        return "❌ Failed"
      default:
        return status
    }
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
                <Td>{getStatusText(deployment.status)}</Td>
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
