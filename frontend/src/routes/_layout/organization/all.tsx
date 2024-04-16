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

import { OrganizationsService } from "../../../client"
import ActionsMenu from "../../../components/Common/ActionsMenu"
import useCustomToast from "../../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/organization/all")({
  component: All,
})

function All() {
  const showToast = useCustomToast()
  const {
    data: organizations,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["organizations"],
    queryFn: () => OrganizationsService.readOrganizations({}),
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
            All Organizations
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
                {organizations?.data.map((org) => (
                  <Tr key={org.id}>
                    <Td>{org.name}</Td>
                    <Td>
                      <ActionsMenu type="Organization" value={org} />
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
