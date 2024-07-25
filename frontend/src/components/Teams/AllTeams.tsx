import {
  Container,
  Heading,
  Table,
  Box,
  Th,
  Tr,
  TableContainer,
  Link,
  Tbody,
  Td,
  Thead,
  Skeleton,
  Flex,
  Text,
  Button,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, Link as RouterLink } from "@tanstack/react-router"

import { TeamsService } from "../../client"
import { useEffect } from "react"
import { Route } from "../../routes/_layout/teams/all"

const PER_PAGE = 5

function getTeamsQueryOptions({
  page,
  orderBy,
  order,
}: {
  page: number
  orderBy?: "created_at"
  order?: "asc" | "desc"
}) {
  return {
    queryFn: () =>
      TeamsService.readTeams({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        orderBy,
        order,
      }),
    queryKey: ["teams", { page, orderBy, order }],
  }
}

function TeamsTable() {
  const queryClient = useQueryClient()
  const { page = 1, orderBy, order } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) })

  const {
    data: teams,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getTeamsQueryOptions({ page, orderBy, order }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && teams?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(getTeamsQueryOptions({ page: page + 1 }))
    }
  }, [page, queryClient, hasNextPage, getTeamsQueryOptions])

  return (
    <>
      <TableContainer data-testid="teams-table">
        <Table size={{ base: "sm", md: "md" }}>
          <Thead>
            <Tr>
              <Th>Name</Th>
            </Tr>
          </Thead>
          {isPending ? (
            <Tbody>
              {new Array(5).fill(null).map((_, index) => (
                <Tr key={index}>
                  {new Array(1).fill(null).map((_, index) => (
                    <Td key={index}>
                      <Flex>
                        <Skeleton height="20px" width="20px" />
                      </Flex>
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          ) : (
            <Tbody>
              {teams?.data.map((team) => (
                <Tr key={team.id} opacity={isPlaceholderData ? 0.5 : 1}>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/${team.slug}/`}
                      _hover={{ color: "ui.main", textDecoration: "underline" }}
                    >
                      {team.name}
                    </Link>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
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
    </>
  )
}

const AllTeams = () => {
  return (
    <Container maxW="full" p={12}>
      <Box mb={10}>
        <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
          Teams
        </Heading>

        <Text>View all your teams</Text>
      </Box>

      <TeamsTable />
    </Container>
  )
}

export default AllTeams
