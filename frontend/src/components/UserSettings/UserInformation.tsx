import { Button, Container, useDisclosure } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FaGithub } from "react-icons/fa"

import { UsersService } from "@/client"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError, nameRules } from "@/utils"
import CustomCard from "../Common/CustomCard"
import EditableField from "../Common/EditableField"
import UpdateEmailVerification from "../Common/UpdateEmailVerification"
import ChangePassword from "./ChangePassword"
import DeleteAccount from "./DeleteAccount"

const UserInformation = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const currentUser = useCurrentUser()
  const [showUpdateEmailModal, setShowUpdateEmailModal] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const emailMutation = useMutation({
    mutationFn: (email: string) =>
      UsersService.requestEmailUpdate({
        requestBody: { email },
      }),
    onSuccess: () => {
      setShowUpdateEmailModal(true)
      onOpen()
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const fullNameMutation = useMutation({
    mutationFn: (full_name: string) =>
      UsersService.updateUserMe({
        requestBody: { full_name },
      }),
    onSuccess: () => {
      showToast("Success!", "Full name updated successfully", "success")
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  return (
    <>
      <Container maxW="full" my={4} p={0}>
        <CustomCard title="Full Name">
          <EditableField
            type="full_name"
            value={currentUser?.full_name ?? ""}
            onSubmit={(newFullName) => fullNameMutation.mutate(newFullName)}
            canEdit={true}
            rules={nameRules()}
          />
        </CustomCard>
        <CustomCard title="Email">
          <EditableField
            type="email"
            value={currentUser?.email ?? ""}
            onSubmit={(newEmail) => emailMutation.mutate(newEmail)}
            canEdit={true}
            rules={{ required: "Email is required" }}
          />
        </CustomCard>
        <CustomCard title="Password">
          <ChangePassword />
        </CustomCard>
        <CustomCard title="Connect with Github">
          <Button variant="outline" colorScheme="gray" leftIcon={<FaGithub />}>
            Connect
          </Button>
        </CustomCard>
        <CustomCard>
          <DeleteAccount />
        </CustomCard>
      </Container>
      {showUpdateEmailModal && (
        <UpdateEmailVerification isOpen={isOpen} onClose={onClose} />
      )}
    </>
  )
}

export default UserInformation
