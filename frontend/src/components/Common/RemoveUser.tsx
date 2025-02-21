import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { type TeamsRemoveMemberFromTeamData, TeamsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "@/components/ui/dialog"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { DialogTitle } from "@chakra-ui/react"
import { Trash } from "../../assets/icons"
import { MenuItem } from "../ui/menu"

interface RemoveProps {
  teamId?: string
  userId: string
}

const RemoveUser = ({ teamId, userId }: RemoveProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TeamsRemoveMemberFromTeamData>()

  const mutation = useMutation({
    mutationFn: async (data: TeamsRemoveMemberFromTeamData) => {
      await TeamsService.removeMemberFromTeam(data)
    },
    onSuccess: () => {
      showToast("Success", "The user was removed successfully", "success")
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
      <DialogRoot
        size={{ base: "xs", md: "md" }}
        role="alertdialog"
        placement="center"
      >
        <DialogTrigger asChild>
          <MenuItem value="remove-user" color="error.base">
            <Trash fontSize="16px" />
            Remove User
          </MenuItem>
        </DialogTrigger>
        <DialogContent>
          <DialogCloseTrigger />
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Remove User</DialogTitle>
            </DialogHeader>
            <DialogBody>
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
            </DialogBody>
            <DialogFooter gap={3}>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <DialogActionTrigger asChild>
                <Button variant="solid" type="submit" loading={isSubmitting}>
                  Confirm
                </Button>
              </DialogActionTrigger>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default RemoveUser
