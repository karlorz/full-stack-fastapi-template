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

import { OrganizationsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

interface DeleteProps {
  orgId?: string
  type: string
  id: number
  isOpen: boolean
  onClose: () => void
}

const Remove = ({ orgId, type, id, isOpen, onClose }: DeleteProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()

  const mutation = useMutation({
    mutationFn: async ({
      orgId,
      userId,
    }: { orgId: number; userId: number }): Promise<void> => {
      await OrganizationsService.removeMemberFromOrganization({
        orgId,
        userId,
      })
    },
    onSuccess: () => {
      showToast(
        "Success",
        `The ${type.toLowerCase()} was removed successfully.`,
        "success",
      )
      onClose()
    },
    onError: () => {
      showToast(
        "An error occurred.",
        `An error occurred while deleting the ${type.toLowerCase()}.`,
        "error",
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate({ orgId: Number(orgId), userId: id })
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
            <AlertDialogHeader>Remove {type}</AlertDialogHeader>

            <AlertDialogBody>
              <span>
                This user will no longer have access to this organization. All{" "}
                <strong>
                  associated data and permissions will be revoked.
                </strong>{" "}
              </span>
              To restore access, you'll need to invite this user to the
              organization again.
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
                Remove User
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default Remove
