import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import {
  Badge,
  Box,
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
import { useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink, useNavigate } from "@tanstack/react-router"

import { TeamsService, UsersService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import { isLoggedIn } from "@/hooks/useAuth"
import { useEffect } from "react"

const PER_PAGE = 5

function getTeamsQueryOptions({
  page,
  orderBy = "created_at",
  order = "desc",
}: {
  page: number
  orderBy?: "created_at"
  order?: "asc" | "desc"
}) {
  return {
    queryFn: () =>
      TeamsService.readTeams({
        skip: (page - 1) * PER_PAGE,
        // Fetching one extra to determine if there's a next page
        limit: PER_PAGE + 1,
        orderBy,
        order,
      }),
    queryKey: ["teams", { page, orderBy, order }],
  }
}
const teamsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
})

export const Route = createFileRoute("/_layout/teams/all")({
  component: AllTeams,
  validateSearch: (search) => teamsSearchSchema.parse(search),
  loaderDeps: ({ search: { page, orderBy, order } }) => ({
    page,
    orderBy,
    order,
  }),
  loader: async ({ context, deps }) => {
    const userPromise = isLoggedIn()
      ? context.queryClient.ensureQueryData({
          queryKey: ["currentUser"],
          queryFn: () => (isLoggedIn() ? UsersService.readUserMe() : null),
        })
      : new Promise<null>((resolve) => resolve(null))

    const teamsPromise = context.queryClient.fetchQuery(
      getTeamsQueryOptions({
        page: deps.page || 1,
        orderBy: deps.orderBy,
        order: deps.order,
      }),
    )

    const [currentUser, teams] = await Promise.all([userPromise, teamsPromise])

    return { teams, currentUser }
  },
})

function AllTeams() {
  const queryClient = useQueryClient()
  const { page = 1, orderBy, order } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev: any) => ({ ...prev, page }) })

  const {
    teams: { data },
    currentUser,
  } = Route.useLoaderData()

  const hasNextPage = data.length === PER_PAGE + 1
  const teams = data.slice(0, PER_PAGE)

  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getTeamsQueryOptions({ page: page + 1, orderBy, order }),
      )
    }
  }, [page, queryClient, hasNextPage, orderBy, order])

  return (
    <Container maxW="full" p={0}>
      <Box mb={10}>
        <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
          Teams
        </Heading>

        <Text>View all your teams</Text>
      </Box>

      <CustomCard>
        <TableContainer data-testid="teams-table">
          <Table size={{ base: "sm", md: "md" }} variant="unstyled">
            <Thead>
              <Tr>
                <Th textTransform="capitalize">Name</Th>
              </Tr>
            </Thead>
            <Tbody>
              {teams.map((team) => (
                <Tr key={team.id}>
                  <Td>
                    <Link
                      as={RouterLink}
                      to={`/${team.slug}/`}
                      _hover={{ color: "ui.main", textDecoration: "underline" }}
                      display="inline-block"
                      minW="20%"
                    >
                      {team.name}
                    </Link>
                    {team.is_personal_team ? (
                      <Badge ml={2}>Personal</Badge>
                    ) : team.owner_id === currentUser?.id ? (
                      <Badge ml={2} colorScheme="purple">
                        Owner
                      </Badge>
                    ) : (
                      <Badge ml={2}>Member</Badge>
                    )}
                  </Td>
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
            <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </Flex>
        )}
      </CustomCard>
    </Container>
  )
}
