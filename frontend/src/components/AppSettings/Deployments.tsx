import { EmptyBox } from "@/assets/icons"
import type { DeploymentPublic } from "@/client"
import { Status } from "@/components/Deployment/Status"
import { Center, Flex, Separator, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import { Fragment } from "react"
import EmptyState from "../Common/EmptyState"

const Deployments = ({
  deployments,
}: { deployments: Array<DeploymentPublic> }) => {
  return (
    <>
      {deployments?.length > 0 ? (
        <>
          {deployments.map((deployment: DeploymentPublic) => (
            <Fragment key={deployment.id}>
              <RouterLink to={`./deployments/${deployment.id}`}>
                <Flex
                  key={deployment.id}
                  align="center"
                  justify="space-between"
                  mb={2}
                  p={4}
                  cursor="pointer"
                >
                  <Flex justify="space-between" width="100%">
                    <Flex direction="column">
                      <Text className="main-link">{deployment.id}</Text>
                      <Text fontSize="xs">
                        <Status deployment={deployment} />
                      </Text>
                    </Flex>
                    <Text fontSize="xs" color="gray.500">
                      Created At:{" "}
                      {new Date(deployment.created_at).toLocaleString()}
                    </Text>
                  </Flex>
                </Flex>
              </RouterLink>
              <Separator />
            </Fragment>
          ))}
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
