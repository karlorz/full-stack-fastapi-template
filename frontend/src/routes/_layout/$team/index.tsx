import { Box, Button, Container, Flex, Text } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  notFound,
} from "@tanstack/react-router"

import CustomCard from "@/components/Common/CustomCard"
import PendingDashboard from "@/components/PendingComponents/PendingDashboard"
import {
  StatHelpText,
  StatLabel,
  StatRoot,
  StatValueText,
} from "@/components/ui/stat"
import { useCurrentUser } from "@/hooks/useAuth"
import {
  deploymentStatusMessage,
  fetchLastApp,
  fetchLastAppsInLast30Days,
  fetchTeamBySlug,
  getLastDeploymentStatus,
} from "@/utils"

export const Route = createFileRoute("/_layout/$team/")({
  component: Dashboard,
  loader: async ({ params: { team } }) => {
    try {
      const teamData = await fetchTeamBySlug(team)

      const apps = await fetchLastAppsInLast30Days(teamData.id)
      const lastApp = await fetchLastApp(teamData.id)
      const lastDeploymentStatus = lastApp?.id
        ? await getLastDeploymentStatus(lastApp.id)
        : null

      return { apps, lastApp, lastDeploymentStatus }
    } catch (error) {
      if (localStorage.getItem("current_team") === team) {
        localStorage.removeItem("current_team")
      }

      throw notFound({
        data: { team },
      })
    }
  },
  pendingComponent: PendingDashboard,
})

const CurrentUser = () => {
  const currentUser = useCurrentUser()

  return currentUser?.full_name || currentUser?.email
}

function Dashboard() {
  const { apps, lastApp, lastDeploymentStatus } = Route.useLoaderData()

  return (
    <Container maxW="full" p={0}>
      <CustomCard data-testid="result">
        <Box fontSize="2xl" truncate maxW="100%">
          Hi, <CurrentUser />
        </Box>
        <Text>Welcome back, nice to see you again!</Text>
      </CustomCard>
      <Flex direction={{ base: "column", md: "row" }} gap={4}>
        <CustomCard title={lastApp?.name} w={{ base: "100%", md: "55%" }}>
          <Text>{deploymentStatusMessage(lastDeploymentStatus)}</Text>
          <RouterLink to={`/$team/apps/${lastApp?.slug}/`}>
            {lastApp && (
              <Button variant="outline" mt={4}>
                View App
              </Button>
            )}
          </RouterLink>
        </CustomCard>

        <CustomCard title="Statistics" w={{ base: "100%", md: "45%" }}>
          <StatRoot
            mt={2}
            display="flex"
            flexDir={{ base: "column", md: "row" }}
          >
            <StatRoot>
              <StatLabel>Apps</StatLabel>
              <StatValueText value={apps.length} />
              <StatHelpText>Last 30 days</StatHelpText>
            </StatRoot>
          </StatRoot>
        </CustomCard>
      </Flex>
    </Container>
  )
}
