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

import { UsersService } from "../../client"
import useAuth from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"

interface DeleteProps {
  isOpen: boolean
  onClose: () => void
}

const DeleteConfirmation = ({ isOpen, onClose }: DeleteProps) => {
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const queryClient = useQueryClient()
  const { handleSubmit } = useForm()
  const showToast = useCustomToast()
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: async () => {
      await UsersService.deleteUserMe()
    },
    onSuccess: () => {
      showToast("Success", "Your account was deleted successfully", "success")
      onClose()
      logout()
    },
    onError: () => {
      showToast(
        "An error occurred.",
        "An error occurred while deleting your account",
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
              All your account data will be{" "}
              <strong>permanently deleted.</strong> If you are sure, please
              click <strong>"Confirm"</strong> to proceed. This action cannot be
              undone.
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
