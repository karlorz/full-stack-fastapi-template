import {
  Button,
  Container,
  Flex,
  Heading,
  Separator,
  Text,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { Fragment } from "react"
import { z } from "zod"

import { EmptyBox } from "@/assets/icons"
import { AppsService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import EmptyState from "@/components/Common/EmptyState"
import QuickStart from "@/components/Common/QuickStart"
import PendingApps from "@/components/PendingComponents/PendingApps"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { fetchTeamBySlug } from "@/utils"

const appsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

const PER_PAGE = 5

function getAppsQueryOptions({
  page,
  orderBy = "created_at",
  order,
  teamId,
}: {
  page: number
  orderBy?: "created_at"
  order?: "asc" | "desc"
  teamId: string
}) {
  return {
    queryFn: () =>
      AppsService.readApps({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        orderBy,
        order,
        teamId,
      }),
    queryKey: ["apps", { page, orderBy, order, teamId }],
  }
}

export const Route = createFileRoute("/_layout/$team/apps/")({
  component: Apps,
  validateSearch: (search) => appsSearchSchema.parse(search),
  loaderDeps: ({ search: { page, orderBy, order } }) => ({
    page,
    orderBy,
    order,
  }),
  loader: async ({ context, params, deps }) => {
    // TODO: make a function to get the query options for this
    const team = await context.queryClient.fetchQuery({
      queryFn: () => fetchTeamBySlug(params.team),
      queryKey: ["team", { slug: params.team }],
    })

    const apps = await context.queryClient.fetchQuery(
      getAppsQueryOptions({
        teamId: team.id,
        page: deps.page || 1,
        orderBy: deps.orderBy,
        order: deps.order,
      }),
    )

    return { team, apps }
  },
  pendingComponent: PendingApps,
})

function Apps() {
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const {
    apps: { data, count },
  } = Route.useLoaderData()

  const apps = data.slice(0, PER_PAGE)

  return (
    <Container maxW="full" p={0}>
      <Heading size="xl" pb={2}>
        Apps
      </Heading>
      <Text textAlign="inherit">
        View and manage apps related to your team.
      </Text>
      <Flex justifyContent={{ base: "inherit", md: "end" }} my={4}>
        <RouterLink to="/$team/new-app">
          <Button>Create App</Button>
        </RouterLink>
      </Flex>
      {apps?.length > 0 ? (
        <>
          <CustomCard>
            <Flex direction="column">
              {apps.map(({ id, name, slug, created_at }) => (
                <Fragment key={id}>
                  <RouterLink to={`/$team/apps/${slug}/`}>
                    <Flex
                      key={id}
                      align="center"
                      display="column"
                      mb={2}
                      py={4}
                      cursor="pointer"
                    >
                      <Flex justify="space-between" width="100%">
                        <Flex direction="column">
                          <Text className="main-link">{name}</Text>
                          <Text fontSize="xs">{slug}</Text>
                        </Flex>
                        <Text fontSize="xs" color="gray.500">
                          Created At: {new Date(created_at).toLocaleString()}
                        </Text>
                      </Flex>
                    </Flex>
                  </RouterLink>
                  <Separator />
                </Fragment>
              ))}
            </Flex>
            <Flex justifyContent="flex-end" mt={4}>
              <PaginationRoot
                count={count}
                pageSize={PER_PAGE}
                onPageChange={({ page }) => setPage(page)}
              >
                <Flex>
                  <PaginationPrevTrigger />
                  <PaginationItems />
                  <PaginationNextTrigger />
                </Flex>
              </PaginationRoot>
            </Flex>
          </CustomCard>
        </>
      ) : (
        <Flex gap={4} pt={{ md: 10 }} flexDir={{ base: "column", md: "row" }}>
          <EmptyState
            title="You don't have any app yet"
            description="Create your first app to get started and deploy it to the cloud."
            icon={EmptyBox}
          />
          <QuickStart />
        </Flex>
      )}
    </Container>
  )
}

export default Apps
