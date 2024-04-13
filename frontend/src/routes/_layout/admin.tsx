import {
  Badge,
  Container,
  Flex,
  Heading,
  Icon,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { createFileRoute } from "@tanstack/react-router"
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleXmark } from "react-icons/fa6"

import { type UserPublic, UsersService } from "../../client"
import ActionsMenu from "../../components/Common/ActionsMenu"
import TableActionsButtons from "../../components/Common/TableActionsButtons"
import useCustomToast from "../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/admin")({
  component: Admin,
})

function Admin() {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"])
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: () => UsersService.readUsers({}),
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
        users && (
          <Container maxW="large" px={12} py={2}>
            <Flex
              flexDir={{ base: "column", md: "row" }}
              justify="space-between"
              alignItems="center"
            >
              <Heading size="md" textAlign={{ base: "center", md: "left" }}>
                FastAPI Labs Inc.
              </Heading>
              <TableActionsButtons type={"User"} />
            </Flex>
            <Heading size="sm" textTransform="uppercase" mb={8}>
              Members
            </Heading>
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
                <Tbody>
                  {users.data.map((user) => (
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
                      <Td>{user.is_superuser ? "Superuser" : "User"}</Td>
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
                          type="User"
                          value={user}
                          disabled={currentUser?.id === user.id ? true : false}
                        />
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Container>
        )
      )}
    </>
  )
}
