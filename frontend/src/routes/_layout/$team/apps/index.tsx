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
import { z } from "zod"

import { useEffect } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { AppsService } from "../../../../client"
import EmptyState from "../../../../components/Apps/EmptyState"

const appsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export const Route = createFileRoute("/_layout/$team/apps/")({
  component: Apps,
  validateSearch: (search) => appsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getAppsQueryOptions({
  page,
  orderBy,
  order,
  teamSlug,
}: {
  page: number
  orderBy?: "created_at"
  order?: "asc" | "desc"
  teamSlug: string
}) {
  return {
    queryFn: () =>
      AppsService.readApps({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        orderBy,
        order,
        teamSlug,
      }),
    queryKey: ["apps", { page, orderBy, order, teamSlug }],
  }
}

function Apps() {
  const queryClient = useQueryClient()
  const { team: teamSlug } = Route.useParams()
  const { page = 1, orderBy, order } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) })

  const {
    data: apps,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getAppsQueryOptions({ page, orderBy, order, teamSlug }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && apps?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getAppsQueryOptions({ page: page + 1, orderBy, order, teamSlug }),
      )
    }
  }, [page, queryClient, hasNextPage])

  return (
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }} mb={6}>
        Apps
      </Heading>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }} variant="unstyled">
          <Thead>
            <Tr>
              <Th>Name</Th>
            </Tr>
          </Thead>
          <ErrorBoundary
            fallbackRender={({ error }) => (
              <Tbody>
                <Tr>
                  <Td colSpan={4}>Something went wrong: {error.message}</Td>
                </Tr>
              </Tbody>
            )}
          >
            <Tbody>
              {isPending ? (
                <>
                  {new Array(3).fill(null).map((_, index) => (
                    <Tr key={index}>
                      <Td>
                        <Box width="50%">
                          <Skeleton height="20px" />
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                </>
              ) : apps?.data?.length ? (
                apps?.data.map((app) => (
                  <Tr key={app.id} opacity={isPlaceholderData ? 0.5 : 1}>
                    <Td>
                      <Link
                        as={RouterLink}
                        to={`/$team/${app.slug}/`}
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
                  </Tr>
                ))
              ) : (
                <Tr>
                  <EmptyState />
                </Tr>
              )}
            </Tbody>
          </ErrorBoundary>
        </Table>
      </TableContainer>

      <Flex
        gap={4}
        alignItems="center"
        mt={4}
        direction="row"
        justifyContent="flex-end"
      >
        <Button onClick={() => setPage(page - 1)} isDisabled={!hasPreviousPage}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
          Next
        </Button>
      </Flex>
    </Container>
  )
}

export default Apps
