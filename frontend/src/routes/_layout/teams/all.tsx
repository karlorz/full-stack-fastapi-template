import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  Table,
  Text,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { Link as RouterLink, useNavigate } from "@tanstack/react-router"
import { z } from "zod"

import { TeamsService, UsersService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { isLoggedIn } from "@/hooks/useAuth"

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
        limit: PER_PAGE,
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
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({
      search: (prev: { [key: string]: string }) => ({ ...prev, page }),
    })

  const {
    teams: { data, count },
    currentUser,
  } = Route.useLoaderData()

  const teams = data.slice(0, PER_PAGE)

  return (
    <Container maxW="full" p={0}>
      <Box mb={10}>
        <Heading size="xl" textAlign={{ base: "center", md: "left" }} pb={2}>
          Teams
        </Heading>
        <Text>View all your teams</Text>
      </Box>

      <CustomCard>
        <Table.Root
          size={{ base: "sm", md: "md" }}
          variant="outline"
          data-testid="teams-table"
          interactive
        >
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader textTransform="capitalize">
                Name
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teams.map((team) => (
              <Table.Row key={team.id}>
                <Table.Cell>
                  <RouterLink to={`/${team.slug}/`}>{team.name}</RouterLink>
                  {team.is_personal_team ? (
                    <Badge ml={2}>Personal</Badge>
                  ) : team.owner_id === currentUser?.id ? (
                    <Badge ml={2} colorScheme="purple">
                      Owner
                    </Badge>
                  ) : (
                    <Badge ml={2}>Member</Badge>
                  )}
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
    </Container>
  )
}
