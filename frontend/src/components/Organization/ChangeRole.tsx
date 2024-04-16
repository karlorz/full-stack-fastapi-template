import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import React from "react"
import { useForm } from "react-hook-form"

import { OrganizationsService, type Role, type UserPublic } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

interface ChangeRoleProps {
  userRole?: string
  orgId?: string
  user: UserPublic
  isOpen: boolean
  onClose: () => void
}

const ChangeRole = ({
  userRole,
  orgId,
  user,
  isOpen,
  onClose,
}: ChangeRoleProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  const mutation = useMutation({
    mutationFn: (data: { newRole: Role }) =>
      OrganizationsService.updateMemberInOrganization({
        orgId: Number(orgId),
        requestBody: { role: data.newRole },
        userId: user.id,
      }),
    onSuccess: () => {
      showToast("Success", "The role was updated successfully.", "success")
      onClose()
    },
    onError: () => {
      showToast(
        "An error occurred.",
        "An error occurred while updating the role.",
        "error",
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    const newRole = userRole === "admin" ? "member" : "admin"
    mutation.mutate({ newRole })
  }

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent as="form" onSubmit={handleSubmit(onSubmit)}>
            <AlertDialogHeader>Change Role</AlertDialogHeader>

            <AlertDialogBody>
              {userRole === "member" ? (
                <>
                  Are you sure you want to promote the user to{" "}
                  <strong>Admin</strong>?
                </>
              ) : (
                <>
                  Are you sure you want to demote the user to{" "}
                  <strong>Member</strong>?
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="danger" type="submit" isLoading={isSubmitting}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default ChangeRole
