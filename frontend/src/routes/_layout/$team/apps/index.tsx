import { Button, Container, Flex, Heading, Table, Text } from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import { EmptyBox } from "@/assets/icons"
import { AppsService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import EmptyState from "@/components/Common/EmptyState"
import QuickStart from "@/components/Common/QuickStart"
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
  order = "desc",
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
})

function Apps() {
  const headers = ["name", "slug", "created at"]
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
      <Heading size="xl" textAlign={{ base: "center", md: "left" }} pb={2}>
        Apps
      </Heading>
      <Text>View and manage apps related to your team.</Text>
      <Flex justifyContent="end">
        <RouterLink to="/$team/apps/new">
          <Button mb={4}>Create App</Button>
        </RouterLink>
      </Flex>
      {apps?.length > 0 ? (
        <>
          <CustomCard>
            <Table.Root
              size={{ base: "sm", md: "md" }}
              variant="outline"
              interactive
            >
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
                {apps.map(({ id, name, slug, created_at }) => (
                  <Table.Row key={id}>
                    <Table.Cell>
                      <RouterLink
                        to={`/$team/apps/${slug}/`}
                        style={{
                          display: "inline-block",
                          minWidth: "20%",
                        }}
                      >
                        {name}
                      </RouterLink>
                    </Table.Cell>
                    <Table.Cell>{slug}</Table.Cell>
                    <Table.Cell>
                      {new Date(created_at).toLocaleString()}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
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
        <Flex gap={4} pt={10} flexDir={{ base: "column", md: "row" }}>
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
