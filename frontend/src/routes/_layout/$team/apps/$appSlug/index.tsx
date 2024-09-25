import { ExternalLinkIcon } from "@chakra-ui/icons"
import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  Skeleton,
  Text,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import { AppsService } from "../../../../../client"
import DeleteApp from "../../../../../components/AppSettings/DeleteApp"
import Deployments from "../../../../../components/AppSettings/Deployments"
import CustomCard from "../../../../../components/Common/CustomCard"
import { fetchTeamBySlug } from "../../../../../utils"

export const Route = createFileRoute("/_layout/$team/apps/$appSlug/")({
  component: AppDetail,
  loader: async ({ params }) => {
    const team = await fetchTeamBySlug(params.team)

    const apps = await AppsService.readApps({
      teamId: team.id,
      slug: params.appSlug,
    })

    return apps.data[0]
  },
  pendingComponent: () => (
    <Box>
      <Skeleton height="20px" my="10px" />
      <Skeleton height="20px" my="10px" />
      <Skeleton height="20px" my="10px" />
    </Box>
  ),
})

function AppDetail() {
  const app = Route.useLoaderData()

  return (
    <Container maxW="full">
      <Flex alignItems="center">
        <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
          {app?.name}
        </Heading>
      </Flex>
      <Box>
        <Box pb={10}>
          {app.url && (
            <Link href={app.url} isExternal color="ui.main">
              {app.url}
              <ExternalLinkIcon mx="2px" />
            </Link>
          )}
          <Text>
            Last Updated: {new Date(app?.updated_at).toLocaleString()}
          </Text>
          <Box pt={10}>
            <CustomCard title="Deployments">
              <Deployments appId={app.id} />
            </CustomCard>
            <CustomCard>
              <DeleteApp appSlug={app.slug} appId={app.id} />
            </CustomCard>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
