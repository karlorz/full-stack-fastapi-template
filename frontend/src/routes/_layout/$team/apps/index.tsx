import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Link,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { z } from "zod"

import { AppsService } from "../../../../client"
import EmptyState from "../../../../components/Common/EmptyState"
import QuickStart from "../../../../components/Common/QuickStart"
import { fetchTeamBySlug } from "../../../../utils"

const appsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export const Route = createFileRoute("/_layout/$team/apps/")({
  component: Apps,
  validateSearch: (search) => appsSearchSchema.parse(search),
  loader: ({ params }) => fetchTeamBySlug(params.team),
})

const PER_PAGE = 5

function getAppsQueryOptions({
  page,
  orderBy,
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

function Apps() {
  const headers = ["name", "slug", "created at"]
  const queryClient = useQueryClient()
  const { page = 1, orderBy, order } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: any) => ({ ...prev, page }) })

  const team = Route.useLoaderData()

  const {
    data: apps,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getAppsQueryOptions({ page, orderBy, order, teamId: team.id }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && apps?.data.length === PER_PAGE
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
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
        Apps
      </Heading>
      <Text>View and manage apps related to your team.</Text>
      {(apps?.data?.length ?? 0) > 0 && (
        <Flex justifyContent="end">
          <Button variant="primary" as={RouterLink} to="/$team/apps/new" mb={4}>
            Create App
          </Button>
        </Flex>
      )}
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <Box>Something went wrong: {error.message}</Box>
        )}
      >
        {isPending ? (
          <TableContainer>
            <Table size={{ base: "sm", md: "md" }} variant="unstyled">
              <Thead>
                <Tr>
                  {headers.map((header) => (
                    <Th key={header} textTransform="capitalize">
                      {header}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {new Array(3).fill(null).map((_, index) => (
                  <Tr key={index}>
                    <Td>
                      <Box width="50%">
                        <Skeleton height="20px" />
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : apps?.data?.length ? (
          <>
            <TableContainer>
              <Table size={{ base: "sm", md: "md" }} variant="unstyled">
                <Thead>
                  <Tr>
                    {headers.map((header) => (
                      <Th key={header} textTransform="capitalize">
                        {header}
                      </Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {apps?.data.map((app) => (
                    <Tr key={app.id} opacity={isPlaceholderData ? 0.5 : 1}>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/$team/apps/${app.slug}/`}
                          _hover={{
                            color: "ui.main",
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
          </>
        ) : (
          <Flex gap={4} pt={10} flexDir={{ base: "column", md: "row" }}>
            <EmptyState type="app" />
            <QuickStart />
          </Flex>
        )}
      </ErrorBoundary>
    </Container>
  )
}

export default Apps
