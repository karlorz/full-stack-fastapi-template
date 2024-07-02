import { Box, Button, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { FaGithub } from "react-icons/fa"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type ApiError, type UserUpdateMe, UsersService } from "../../client"
import { useCurrentUser } from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import EditableField from "../Common/EditableField"
import ChangePassword from "./ChangePassword"
import DeleteAccount from "./DeleteAccount"

const UserInformation = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const currentUser = useCurrentUser()

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({
        requestBody: data,
      }),
    onSuccess: () => {
      showToast("Success!", "User updated successfully", "success")
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  return (
    <>
      <Container maxW="full" m={4}>
        <Heading size="sm">User Information</Heading>
        <Text py={2} mb={4}>
          See and manage your user information.
        </Text>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Box my={4}>
            <Text fontWeight="bold" mb={4}>
              Full Name
            </Text>
            <EditableField
              type="full_name"
              value={currentUser?.full_name ?? ""}
              onSubmit={(newFullName) =>
                mutation.mutate({ full_name: newFullName })
              }
              canEdit={true}
            />
          </Box>
        </Box>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Box my={4}>
            <Text fontWeight="bold" mb={4}>
              Email
            </Text>
            <EditableField
              type="email"
              value={currentUser?.email ?? ""}
              onSubmit={(newEmail) => mutation.mutate({ email: newEmail })}
              canEdit={true}
            />
          </Box>
        </Box>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Box my={4}>
            <Text fontWeight="bold" mb={4}>
              Password
            </Text>
            <ChangePassword />
          </Box>
        </Box>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Box my={4}>
            <Text fontWeight="bold" mb={4}>
              Connect with Github
            </Text>
            <Button
              variant="outline"
              colorScheme="gray"
              leftIcon={<FaGithub />}
            >
              Connect
            </Button>
          </Box>
        </Box>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Text fontWeight="bold" mb={4}>
            Danger Zone
          </Text>
          <Flex>
            <DeleteAccount />
          </Flex>
        </Box>
      </Container>
    </>
  )
}

export default UserInformation
