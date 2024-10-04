import { ExternalLinkIcon } from "@chakra-ui/icons"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Skeleton,
  Text,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect } from "react"
import { z } from "zod"

import { AppsService, DeploymentsService } from "@/client"
import DeleteApp from "@/components/AppSettings/DeleteApp"
import Deployments from "@/components/AppSettings/Deployments"
import EnvironmentVariables from "@/components/AppSettings/EnvironmentVariables"
import CustomCard from "@/components/Common/CustomCard"
import { fetchTeamBySlug } from "@/utils"

const deploymentsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

const PER_PAGE = 5

function getDeploymentsQueryOptions({
  page,
  orderBy = "created_at",
  order = "desc",
  appId,
}: {
  page: number
  orderBy?: "created_at"
  order?: "asc" | "desc"
  appId: string
}) {
  return {
    queryFn: () =>
      DeploymentsService.readDeployments({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE + 1,
        orderBy,
        order,
        appId,
      }),
    queryKey: ["deployments", { page, orderBy, order, appId }],
  }
}

export const Route = createFileRoute("/_layout/$team/apps/$appSlug/")({
  component: AppDetail,
  validateSearch: (search) => deploymentsSearchSchema.parse(search),
  loaderDeps: ({ search: { page, orderBy, order } }) => ({
    page,
    orderBy,
    order,
  }),
  loader: async ({ context, params, deps }) => {
    const team = await fetchTeamBySlug(params.team)

    const apps = await AppsService.readApps({
      teamId: team.id,
      slug: params.appSlug,
    })

    const deployments = await context.queryClient.fetchQuery(
      getDeploymentsQueryOptions({
        appId: apps.data[0].id,
        page: deps.page || 1,
        orderBy: deps.orderBy,
        order: deps.order,
      }),
    )

    const app = apps.data[0]

    await context.queryClient.ensureQueryData({
      queryKey: ["apps", app.id, "environmentVariables"],
      queryFn: () => AppsService.readEnvironmentVariables({ appId: app.id }),
    })

    return { app, deployments }
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
  const { page = 1, order, orderBy } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: any) => ({ ...prev, page }) })
  const queryClient = useQueryClient()

  const {
    app,
    deployments: { data },
  } = Route.useLoaderData()

  const hasNextPage = data.length === PER_PAGE + 1
  const deployments = data.slice(0, PER_PAGE)

  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getDeploymentsQueryOptions({
          page: page + 1,
          orderBy,
          order,
          appId: app.id,
        }),
      )
    }
  }, [page, queryClient, hasNextPage, order, orderBy, app.id])

  const { data: environmentVariables } = useQuery({
    queryKey: ["apps", app.id, "environmentVariables"],
    queryFn: () => AppsService.readEnvironmentVariables({ appId: app.id }),
  })

  return (
    <Container maxW="full" p={0}>
      <Heading size="lg" pb={2}>
        {app?.name}
      </Heading>
      <Box pb={10}>
        {app.url && (
          <Link href={app.url} isExternal color="ui.main" fontWeight="bold">
            {app.url}
            <ExternalLinkIcon mx="2px" />
          </Link>
        )}
        <Text>Last Updated: {new Date(app?.updated_at).toLocaleString()}</Text>
        <Box pt={10}>
          <CustomCard title="Deployments">
            <Deployments deployments={deployments} />
            {(hasPreviousPage || hasNextPage) && (
              <Flex
                gap={4}
                alignItems="center"
                mt={4}
                direction="row"
                justifyContent="flex-end"
              >
                <Button
                  onClick={() => setPage(page - 1)}
                  isDisabled={!hasPreviousPage}
                >
                  Previous
                </Button>
                <span>Page {page}</span>
                <Button
                  isDisabled={!hasNextPage}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </Flex>
            )}
          </CustomCard>

          <CustomCard title="Environment Variables">
            <EnvironmentVariables
              environmentVariables={environmentVariables?.data || []}
              appId={app.id}
            />
          </CustomCard>

          <CustomCard>
            <DeleteApp appSlug={app.slug} appId={app.id} />
          </CustomCard>
        </Box>
      </Box>
    </Container>
  )
}
