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

import { useNavigate } from "@tanstack/react-router"
import { TeamsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { Route } from "../../routes/_layout/$team"

interface DeleteProps {
  isOpen: boolean
  onClose: () => void
}

const DeleteConfirmation = ({ isOpen, onClose }: DeleteProps) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const { team } = Route.useParams()
  const queryClient = useQueryClient()
  const { handleSubmit } = useForm()
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      await TeamsService.deleteTeam({ teamSlug: team })
    },
    onSuccess: () => {
      showToast("Success", "The team was deleted successfully", "success")
      onClose()
      navigate({ to: "/teams/all" })
    },
    onError: () => {
      showToast(
        "An error occurred.",
        "An error occurred while deleting the team",
        "error",
      )
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
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
            <AlertDialogHeader>Confirmation Required</AlertDialogHeader>

            <AlertDialogBody>
              This team will be <strong>permanently deleted.</strong> If you are
              sure, please click <strong>"Confirm"</strong> to proceed. This
              action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button variant="danger" type="submit">
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default DeleteConfirmation
