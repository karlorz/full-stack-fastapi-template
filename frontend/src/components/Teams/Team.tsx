import {
  Badge,
  Box,
  Container,
  Flex,
  HStack,
  Skeleton,
  Table,
} from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import {
  PaginationItems,
  PaginationNextTrigger,
  PaginationPrevTrigger,
  PaginationRoot,
} from "@/components/ui/pagination"
import { useCurrentUser } from "@/hooks/useAuth"
import { Route } from "@/routes/_layout/$team"
import { fetchTeamBySlug, getCurrentUserRole } from "@/utils"
import ActionsMenu from "../Common/ActionsMenu"

const PER_PAGE = 5

function Team() {
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const [page, setPage] = useState(1)
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })

  const members = team.user_links.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const membersCount = team.user_links.length
  const currentUserRole = getCurrentUserRole(team, currentUser)

  const headers = ["Email", "Role"]
  if (currentUserRole === "admin") {
    headers.push("Actions")
  }

  return (
    <Container maxW="full" p={0}>
      <Table.Root size={{ base: "sm", md: "md" }} variant="outline" interactive>
        <Table.Header>
          <Table.Row>
            {headers.map((header) => (
              <Table.ColumnHeader
                key={header}
                textTransform="capitalize"
                width={header === "Actions" ? "20%" : "40%"}
              >
                {header}
              </Table.ColumnHeader>
            ))}
          </Table.Row>
        </Table.Header>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <Table.Body>
              <Table.Row>
                <Table.Cell colSpan={4}>
                  Something went wrong: {error.message}
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          )}
        >
          <Suspense
            fallback={
              <Table.Body>
                {new Array(3).fill(null).map((_, index) => (
                  <Table.Row key={index}>
                    <Table.Cell colSpan={5}>
                      <Box width="100%">
                        <Skeleton height="20px" />
                      </Box>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            }
          >
            <Table.Body>
              {members.map(({ role, user }) => (
                <Table.Row key={user.id}>
                  <Table.Cell truncate maxWidth="200px">
                    {user.email}
                    {currentUser?.id === user.id && <Badge ml="2">You</Badge>}
                  </Table.Cell>
                  <Table.Cell>
                    {role === "admin" ? "Admin" : "Member"}
                  </Table.Cell>
                  <Table.Cell
                    display={
                      currentUserRole === "member" ||
                      currentUser?.id === user.id
                        ? "none"
                        : "block"
                    }
                  >
                    <ActionsMenu userRole={role} team={team} value={user} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Suspense>
        </ErrorBoundary>
      </Table.Root>
      <Flex justifyContent="flex-end" mt={4}>
        <PaginationRoot
          count={membersCount}
          pageSize={PER_PAGE}
          onPageChange={({ page }) => setPage(page)}
        >
          <HStack>
            <PaginationPrevTrigger />
            <PaginationItems />
            <PaginationNextTrigger />
          </HStack>
        </PaginationRoot>
      </Flex>
    </Container>
  )
}

export default Team
