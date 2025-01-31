import { AppsService, DeploymentsService } from "@/client"
import Logs from "@/components/Deployment/Logs"
import { Status } from "@/components/Deployment/Status"
import { fetchTeamBySlug } from "@/utils"
import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { createFileRoute, notFound } from "@tanstack/react-router"

export const Route = createFileRoute(
  "/_layout/$team/apps/$appSlug/deployments/$deploymentId",
)({
  component: DeploymentDetail,
  loader: async ({ params }) => {
    try {
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

      const { logs } = await DeploymentsService.readDeploymentLogs({
        deploymentId: deployment.id,
      })

      return { deployment, logs }
    } catch (error) {
      throw notFound()
    }
  },
})

function DeploymentDetail() {
  const { deployment, logs } = Route.useLoaderData()

  return (
    <Container maxW="full" p={0}>
      <Flex alignItems="center">
        <Heading size="xl" pb={2}>
          Deployment Details
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

      <Box pt={10}>
        <Logs logs={logs} />
      </Box>
    </Container>
  )
}

export default DeploymentDetail
