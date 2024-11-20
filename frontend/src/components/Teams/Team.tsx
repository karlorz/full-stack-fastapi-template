import { Badge, Box, Container, Flex, Skeleton, Table } from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { useCurrentUser } from "../../hooks/useAuth"
import { Route } from "../../routes/_layout/$team"
import { fetchTeamBySlug, getCurrentUserRole } from "../../utils"
import ActionsMenu from "../Common/ActionsMenu"
import { Button } from "../ui/button"

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
  const hasNextPage = team.user_links.length > page * PER_PAGE
  const hasPreviousPage = page > 1

  const currentUserRole = getCurrentUserRole(team, currentUser)

  const headers = ["Email", "Role"]
  if (currentUserRole === "admin") {
    headers.push("Actions")
  }

  return (
    <Container maxW="full" p={0}>
      <Table.Root size={{ base: "sm", md: "md" }} variant="outline">
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
      {(hasPreviousPage || hasNextPage) && (
        <Flex
          gap={4}
          alignItems="center"
          mt={4}
          direction="row"
          justifyContent="flex-end"
        >
          <Button
            onClick={() => setPage((p) => p - 1)}
            disabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button onClick={() => setPage((p) => p + 1)} disabled={!hasNextPage}>
            Next
          </Button>
        </Flex>
      )}
    </Container>
  )
}

export default Team
