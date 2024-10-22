import { Container, Flex, Skeleton, useDisclosure } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Suspense, useState } from "react"

import { UsersService } from "@/client"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError, nameRules } from "@/utils"
import CustomCard from "../Common/CustomCard"
import EditableField from "../Common/EditableField"
import UpdateEmailVerification from "../Common/UpdateEmailVerification"
import ChangePassword from "./ChangePassword"
import DeleteAccount from "./DeleteAccount"

const UserInformationContent = () => {
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
      <Container maxW="full" my={4} px={0} pt={10}>
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
        {/* TODO: Complete this when GitHub integration it's ready */}
        {/* <CustomCard title="Connect with Github">
          <Button variant="secondary" colorScheme="gray" leftIcon={<FaGithub />}>
            Connect
          </Button>
        </CustomCard> */}
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

const UserInformation = () => {
  return (
    <Suspense
      fallback={
        <Flex
          direction="column"
          justify="center"
          align="center"
          height="80vh"
          gap={4}
          pt={12}
        >
          <Skeleton height="25%" width="100%" />
          <Skeleton height="25%" width="100%" />
          <Skeleton height="25%" width="100%" />
          <Skeleton height="25%" width="100%" />
        </Flex>
      }
    >
      <UserInformationContent />
    </Suspense>
  )
}

export default UserInformation
