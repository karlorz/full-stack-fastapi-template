import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import { AppsService, DeploymentsService } from "@/client"
import { Status } from "@/components/Deployment/Status"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTeamBySlug } from "@/utils"

export const Route = createFileRoute(
  "/_layout/$team/apps/$appSlug/deployments/$deploymentId",
)({
  component: DeploymentDetail,
  loader: async ({ params }) => {
    const team = await fetchTeamBySlug(params.team)

    const apps = await AppsService.readApps({
      teamId: team.id,
      slug: params.appSlug,
    })

    const app = apps.data[0]

    return DeploymentsService.readDeployment({
      // TODO: remove app from backend?
      appId: app.id,
      deploymentId: params.deploymentId,
    })
  },
  pendingComponent: () => (
    <Box>
      <Skeleton height="20px" my="10px" />
      <Skeleton height="20px" my="10px" />
      <Skeleton height="20px" my="10px" />
    </Box>
  ),
})

function DeploymentDetail() {
  const deployment = Route.useLoaderData()

  return (
    <Container maxW="full" p={0}>
      <Flex alignItems="center">
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} pb={2}>
          Deployment details
        </Heading>
      </Flex>
      <Box>
        <Text>
          Last updated: {new Date(deployment?.updated_at).toLocaleString()}
        </Text>
        <Flex as={Text}>
          Status:
          <Status deployment={deployment} />
        </Flex>
      </Box>
    </Container>
  )
}
