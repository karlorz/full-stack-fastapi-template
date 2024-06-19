import {
  Box,
  Container,
  Heading,
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
import { TeamsService } from "../../../client"
import ActionsMenu from "../../../components/Common/ActionsMenu"

export const Route = createFileRoute("/_layout/teams/all")({
  component: AllTeams,
})

function AllTeamsTableBody() {
  const { data: teams } = useSuspenseQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  return (
    <Tbody>
      {teams?.data.map((team) => (
        <Tr key={team.id}>
          <Td isTruncated maxWidth="200px">
            {team.name}
          </Td>
          <Td>
            <ActionsMenu type="Team" value={team} />
          </Td>
        </Tr>
      ))}
    </Tbody>
  )
}

function AllTeamsTable() {
  return (
    <TableContainer py={6}>
      <Table size={{ base: "sm", md: "md" }} variant="unstyled">
        <Thead>
          <Tr>
            <Th textTransform="capitalize">Name</Th>
            <Th textTransform="capitalize">Actions</Th>
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
                {new Array(2).fill(null).map((_, index) => (
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
            <AllTeamsTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function AllTeams() {
  return (
    <Container maxW="full" p={12}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }}>
        All Teams
      </Heading>
      <AllTeamsTable />
    </Container>
  )
}
