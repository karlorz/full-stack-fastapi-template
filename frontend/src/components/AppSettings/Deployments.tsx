import {
  Center,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

import type { DeploymentPublic } from "@/client"
import { Status } from "@/components/Deployment/Status"
import EmptyState from "../Common/EmptyState"

const Deployments = ({
  deployments,
}: { deployments: Array<DeploymentPublic> }) => {
  const headers = ["Deployment ID", "Status", "Created At"]

  return (
    <>
      {deployments?.length > 0 ? (
        <>
          <TableContainer>
            <Table variant="unstyled" mt="4">
              <Thead>
                <Tr>
                  {headers.map((header) => (
                    <Th key={header} textTransform="capitalize" w="33%">
                      {header}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {deployments.map((deployment: any) => (
                  <Tr key={deployment.id}>
                    <Td>
                      <Link to={`./deployments/${deployment.id}`}>
                        {deployment.id}
                      </Link>
                    </Td>
                    <Td>
                      <Status deployment={deployment} />
                    </Td>
                    <Td>{new Date(deployment.created_at).toLocaleString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Center w="full">
          <EmptyState type="deployments" />
        </Center>
      )}
    </>
  )
}

export default Deployments
