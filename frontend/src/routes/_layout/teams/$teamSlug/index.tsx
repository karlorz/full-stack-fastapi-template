import {
  Badge,
  Box,
  Container,
  Flex,
  Heading,
  Icon,
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
import { createFileRoute } from "@tanstack/react-router"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleXmark } from "react-icons/fa6"

import { TeamWithUserPublic } from "../../../../client"
import ActionsMenu from "../../../../components/Common/ActionsMenu"
import { useCurrentUser } from "../../../../hooks/useAuth"
import { fetchTeamBySlug, getCurrentUserRole } from "../../../../utils"

export const Route = createFileRoute("/_layout/teams/$teamSlug/")({
  component: Team,
})

function TeamTableBody({ team }: { team: TeamWithUserPublic }) {
  const currentUser = useCurrentUser()
  const currentUserRole = getCurrentUserRole(team, currentUser)

  return (
    <Tbody>
      {team.user_links.map(({ role, user }) => (
        <Tr key={user.id}>
          <Td color={!user.full_name ? "ui.dim" : "inherit"}>
            {user.full_name || "N/A"}
            {currentUser?.id === user.id && (
              <Badge ml="1" colorScheme="teal">
                You
              </Badge>
            )}
          </Td>
          <Td>{user.email}</Td>
          <Td>{role === "admin" ? "Admin" : "Member"}</Td>
          <Td>
            <Flex gap={2}>
              {user.is_active ? (
                <Icon as={FaCheckCircle} color="ui.success" />
              ) : (
                <Icon as={FaCircleXmark} color="ui.danger" />
              )}
              {user.is_active ? "Active" : "Inactive"}
            </Flex>
          </Td>
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

function TeamTable({ team }: { team: TeamWithUserPublic }) {
  return (
    <TableContainer>
      <Table size={{ base: "sm", md: "md" }}>
        <Thead>
          <Tr>
            <Th>Full name</Th>
            <Th>Email</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
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
                {new Array(5).fill(null).map((_, index) => (
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
            <TeamTableBody team={team} />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Team() {
  const { teamSlug } = Route.useParams()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })

  return (
    <>
      <Container maxW="full" p={12}>
        <Flex flexDir="row" justify="space-between" align="center">
          <Flex flexDir="column">
            <Heading size="md" textAlign={{ base: "center", md: "left" }}>
              {team?.name}
            </Heading>
            <Heading size="sm" textTransform="uppercase" my={8}>
              Members
            </Heading>
          </Flex>
        </Flex>
        <TeamTable team={team} />
      </Container>
    </>
  )
}
