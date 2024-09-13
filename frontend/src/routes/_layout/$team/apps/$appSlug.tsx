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
import { useSuspenseQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { AppsService } from "../../../../client"
import DeleteApp from "../../../../components/AppSettings/DeleteApp"
import Deployments from "../../../../components/AppSettings/Deployments"
import CustomCard from "../../../../components/Common/CustomCard"

export const Route = createFileRoute("/_layout/$team/apps/$appSlug")({
  component: AppDetail,
})

function AppDetail() {
  const { appSlug } = Route.useParams()

  return (
    <ErrorBoundary
      fallbackRender={({ error }) => (
        <Text>Something went wrong: {error.message}</Text>
      )}
    >
      <Suspense
        fallback={
          <Box>
            <Skeleton height="20px" my="10px" />
            <Skeleton height="20px" my="10px" />
            <Skeleton height="20px" my="10px" />
          </Box>
        }
      >
        <AppDetailContent appSlug={appSlug} />
      </Suspense>
    </ErrorBoundary>
  )
}

function AppDetailContent({ appSlug }: { appSlug: string }) {
  const { data: app } = useSuspenseQuery({
    queryKey: ["app", appSlug],
    queryFn: () => AppsService.readApp({ appSlug }),
  })

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
            <CustomCard title="Danger Zone">
              <DeleteApp appSlug={appSlug} />
            </CustomCard>
          </Box>
        </Box>
      </Box>
    </Container>
  )
}
