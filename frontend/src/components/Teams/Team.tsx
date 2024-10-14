import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { useCurrentUser } from "../../hooks/useAuth"
import { Route } from "../../routes/_layout/$team"
import { fetchTeamBySlug, getCurrentUserRole } from "../../utils"
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
  const hasNextPage = team.user_links.length > page * PER_PAGE
  const hasPreviousPage = page > 1

  const currentUserRole = getCurrentUserRole(team, currentUser)

  const headers = ["Email", "Role", "Actions"]

  return (
    <Container maxW="full" p={0}>
      <TableContainer>
        <Table size={{ base: "sm", md: "md" }} variant="unstyled">
          <Thead>
            <Tr>
              {headers.map((header) => (
                <Th
                  key={header}
                  textTransform="capitalize"
                  width={header === "Actions" ? "20%" : "40%"}
                >
                  {header}
                </Th>
              ))}
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
            <Suspense
              fallback={
                <Tbody>
                  {new Array(3).fill(null).map((_, index) => (
                    <Tr key={index}>
                      <Td colSpan={5}>
                        <Box width="100%">
                          <Skeleton height="20px" />
                        </Box>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              }
            >
              <Tbody>
                {members.map(({ role, user }) => (
                  <Tr key={user.id}>
                    <Td isTruncated maxWidth="200px">
                      {user.email}
                      {currentUser?.id === user.id && <Badge ml="2">You</Badge>}
                    </Td>
                    <Td>{role === "admin" ? "Admin" : "Member"}</Td>
                    <Td>
                      <ActionsMenu
                        userRole={role}
                        team={team}
                        type="User"
                        value={user}
                        disabled={
                          currentUserRole === "member" ||
                          currentUser?.id === user.id
                            ? true
                            : false
                        }
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Suspense>
          </ErrorBoundary>
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
            onClick={() => setPage((p) => p - 1)}
            isDisabled={!hasPreviousPage}
          >
            Previous
          </Button>
          <span>Page {page}</span>
          <Button
            onClick={() => setPage((p) => p + 1)}
            isDisabled={!hasNextPage}
          >
            Next
          </Button>
        </Flex>
      )}
    </Container>
  )
}

export default Team
