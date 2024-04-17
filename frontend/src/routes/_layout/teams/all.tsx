import {
  Container,
  Flex,
  Heading,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"

import { TeamsService } from "../../../client"
import ActionsMenu from "../../../components/Common/ActionsMenu"
import useCustomToast from "../../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/teams/all")({
  component: All,
})

function All() {
  const showToast = useCustomToast()
  const {
    data: teams,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  if (isError) {
    const errDetail = (error as any).body?.detail
    showToast("Something went wrong.", `${errDetail}`, "error")
  }

  return (
    <>
      {isLoading ? (
        // TODO: Add skeleton
        <Flex justify="center" align="center" height="100vh" width="full">
          <Spinner size="xl" color="ui.main" />
        </Flex>
      ) : (
        <Container maxW="large" p={12}>
          <Heading size="md" textAlign={{ base: "center", md: "left" }}>
            All Teams
          </Heading>
          <TableContainer py={6}>
            <Table size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {teams?.data.map((team) => (
                  <Tr key={team.id}>
                    <Td>{team.name}</Td>
                    <Td>
                      <ActionsMenu type="Team" value={team} />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Container>
      )}
    </>
  )
}
