import {
  Badge,
  Box,
  Container,
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
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { TeamsService } from "../../client"
import { useCurrentUser } from "../../hooks/useAuth"
import { Route } from "../../routes/_layout/$team"
import { getCurrentUserRole } from "../../utils"
import ActionsMenu from "../Common/ActionsMenu"

function TeamTableBody() {
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => TeamsService.readTeam({ teamSlug: teamSlug }),
  })
  const currentUserRole = getCurrentUserRole(team, currentUser)

  return (
    <Tbody>
      {team.user_links.map(({ role, user }) => (
        <Tr key={user.id}>
          <Td isTruncated maxWidth="200px">
            {user.email}
            {currentUser?.id === user.id && (
              <Badge ml="1" colorScheme="gray">
                You
              </Badge>
            )}
          </Td>
          <Td>{role === "admin" ? "Admin" : "Member"}</Td>
          <Td>
            <ActionsMenu
              userRole={role}
              team={team}
              type="User"
              value={user}
              disabled={
                currentUserRole === "member" || currentUser?.id === user.id
                  ? true
                  : false
              }
            />
          </Td>
        </Tr>
      ))}
    </Tbody>
  )
}

function TeamTable() {
  const headers = ["Email", "Role", "Actions"]

  return (
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
            <TeamTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Team() {
  return (
    <Container maxW="full">
      <TeamTable />
    </Container>
  )
}

export default Team
