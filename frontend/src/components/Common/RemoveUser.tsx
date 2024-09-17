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

import { type TeamsData, TeamsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface RemoveProps {
  teamId?: string
  userId: string
  isOpen: boolean
  onClose: () => void
}

const RemoveUser = ({ teamId, userId, isOpen, onClose }: RemoveProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const cancelRef = React.useRef<HTMLButtonElement | null>(null)
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TeamsData["RemoveMemberFromTeam"]>()

  const mutation = useMutation({
    mutationFn: async (data: TeamsData["RemoveMemberFromTeam"]) => {
      await TeamsService.removeMemberFromTeam(data)
    },
    onSuccess: () => {
      showToast("Success", "The user was removed successfully", "success")
      onClose()
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate({ teamId: teamId!, userId })
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
            <AlertDialogHeader>Remove User</AlertDialogHeader>

            <AlertDialogBody>
              <>
                <span>
                  This user will no longer have access to this team. All{" "}
                  <strong>
                    associated data and permissions will be revoked.
                  </strong>{" "}
                </span>
                <span>
                  To restore access, you'll need to invite this user to the team
                  again.
                </span>
              </>
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
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default RemoveUser
