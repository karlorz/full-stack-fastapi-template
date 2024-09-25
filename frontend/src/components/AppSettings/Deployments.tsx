import { Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { DeploymentsService } from "../../client"
import { Link } from "@tanstack/react-router"
import { DeploymentStatus } from "../Deployment/Status"

const Deployments = ({ appId }: { appId: string }) => {
  const headers = ["Deployment ID", "Status", "Created At"]

  const { data: deployments } = useSuspenseQuery({
    queryKey: ["deployments", appId],
    queryFn: () => DeploymentsService.readDeployments({ appId }),
  })

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
                <Td>
                  <Link to={`./deployments/${deployment.id}`}>
                    {deployment.id}
                  </Link>
                </Td>
                <Td>
                  <DeploymentStatus deployment={deployment} />
                </Td>
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
