import { AppsService, DeploymentsService } from "@/client"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import { fetchTeamBySlug } from "@/utils"
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

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
    const deployment = await DeploymentsService.readDeployment({
      appId: app.id,
      deploymentId: params.deploymentId,
    })
    return { deployment, app }
  },
})

function DeploymentDetail() {
  const { deployment, app } = Route.useLoaderData()

  return (
    <Container maxW="full" p={0}>
      <Flex alignItems="center">
        <Heading size="xl" pb={2}>
          Deployment details
        </Heading>
      </Flex>

      <Box>
        <Text>
          Last updated: {new Date(deployment?.updated_at).toLocaleString()}
        </Text>
        <Flex alignItems="center" gap={2}>
          <Text>Status:</Text>
          <Status deployment={deployment} />
        </Flex>
      </Box>

      <Box pt={8}>
        <Logs appId={app.id} />
      </Box>
    </Container>
  )
}

export default DeploymentDetail
