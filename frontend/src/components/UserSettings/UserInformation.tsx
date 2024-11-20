import { Container, Flex } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Suspense, useState } from "react"

import { UsersService } from "@/client"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError, nameRules } from "@/utils"
import CustomCard from "../Common/CustomCard"
import EditableField from "../Common/EditableField"
import UpdateEmailInfo from "../Common/UpdateEmailInfo"
import { DialogRoot } from "../ui/dialog"
import { Skeleton } from "../ui/skeleton"
import ChangePassword from "./ChangePassword"
import DeleteAccount from "./DeleteAccount"

const UserInformationContent = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const currentUser = useCurrentUser()
  const [isOpen, setIsOpen] = useState(false)

  const emailMutation = useMutation({
    mutationFn: (email: string) =>
      UsersService.requestEmailUpdate({
        requestBody: { email },
      }),
    onSuccess: () => {
      setIsOpen(true)
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
            rules={nameRules()}
          />
        </CustomCard>
        <CustomCard title="Email">
          <EditableField
            type="email"
            value={currentUser?.email ?? ""}
            onSubmit={(newEmail) => emailMutation.mutate(newEmail)}
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
      <DialogRoot
        size={{ base: "xs", md: "md" }}
        open={isOpen}
        onOpenChange={(e) => setIsOpen(e.open)}
        placement="center"
      >
        <UpdateEmailInfo />
      </DialogRoot>
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
