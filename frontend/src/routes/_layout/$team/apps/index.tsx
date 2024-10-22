import {
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import CustomCard from "@/components/Common/CustomCard"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { EmptyBox } from "@/assets/icons"
import { AppsService } from "@/client"
import EmptyState from "@/components/Common/EmptyState"
import QuickStart from "@/components/Common/QuickStart"
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
        // Fetching one extra to determine if there's a next page
        limit: PER_PAGE + 1,
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
  const { page = 1, order, orderBy } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: any) => ({ ...prev, page }) })
  const queryClient = useQueryClient()

  const {
    apps: { data },
    team,
  } = Route.useLoaderData()

  const hasNextPage = data.length === PER_PAGE + 1
  const apps = data.slice(0, PER_PAGE)

  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getAppsQueryOptions({
          page: page + 1,
          orderBy,
          order,
          teamId: team.id,
        }),
      )
    }
  }, [page, queryClient, hasNextPage, order, orderBy, team.id])

  return (
    <Container maxW="full" p={0}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
        Apps
      </Heading>
      <Text>View and manage apps related to your team.</Text>
      <Flex justifyContent="end">
        <Button variant="primary" as={RouterLink} to="/$team/apps/new" mb={4}>
          Create App
        </Button>
      </Flex>
      {apps?.length > 0 ? (
        <>
          <CustomCard>
            <TableContainer>
              <Table size={{ base: "sm", md: "md" }} variant="unstyled">
                <Thead>
                  <Tr>
                    {headers.map((header) => (
                      <Th key={header} textTransform="capitalize" w="33%">
                        {header}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {apps.map((app) => (
                    <Tr key={app.id}>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/$team/apps/${app.slug}/`}
                          _hover={{
                            color: "main.dark",
                            textDecoration: "underline",
                          }}
                          display="inline-block"
                          minW="20%"
                        >
                          {app.name}
                        </Link>
                      </Td>
                      <Td>{app.slug}</Td>
                      <Td>{new Date(app.created_at).toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
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
