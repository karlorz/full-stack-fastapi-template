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

import { type TDataDeleteTeam, TeamsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"

interface DeleteProps {
  teamId?: number
  isOpen: boolean
  onClose: () => void
}

const DeleteTeam = ({ teamId, isOpen, onClose }: DeleteProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TDataDeleteTeam>()

  const mutation = useMutation({
    mutationFn: async (data: TDataDeleteTeam) => {
      await TeamsService.deleteTeam(data)
    },
    onSuccess: () => {
      showToast("Success", "The team was deleted successfully.", "success")
      onClose()
    },
    onError: () => {
      showToast(
        "An error occurred.",
        "An error occurred while deleting the team.",
        "error",
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate({ teamId: teamId! })
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
            <AlertDialogHeader>Delete Team</AlertDialogHeader>

            <AlertDialogBody>
              <span>This team will be permanently deleted.</span>
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
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default DeleteTeam
