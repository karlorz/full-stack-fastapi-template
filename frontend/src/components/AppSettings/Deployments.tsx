import { Center, Table } from "@chakra-ui/react"
import { Link } from "@tanstack/react-router"

import { EmptyBox } from "@/assets/icons"
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
          <Table.Root variant="outline" mt="4" interactive>
            <Table.Header>
              <Table.Row>
                {headers.map((header) => (
                  <Table.ColumnHeader
                    key={header}
                    textTransform="capitalize"
                    w="33%"
                  >
                    {header}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {deployments.map((deployment: DeploymentPublic) => (
                <Table.Row key={deployment.id}>
                  <Table.Cell>
                    <Link to={`./deployments/${deployment.id}`}>
                      {deployment.id}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    <Status deployment={deployment} />
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(deployment.created_at).toLocaleString()}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </>
      ) : (
        <Center w="full">
          <EmptyState
            title="You don't have any deployments yet"
            icon={EmptyBox}
          />
        </Center>
      )}
    </>
  )
}

export default Deployments
