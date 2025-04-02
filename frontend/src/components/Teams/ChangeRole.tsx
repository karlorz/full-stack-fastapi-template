import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { FaExchangeAlt } from "react-icons/fa"
import {
  type Role,
  type TeamUpdateMember,
  TeamsService,
  type UserPublic,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { Button } from "../ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { MenuItem } from "../ui/menu"

interface ChangeRoleProps {
  userRole?: string
  teamId?: string
  user: UserPublic
}

const ChangeRole = ({ userRole, teamId, user }: ChangeRoleProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TeamUpdateMember>()

  const mutation = useMutation({
    mutationFn: (data: { newRole: Role }) =>
      TeamsService.updateMemberInTeam({
        teamId: teamId!,
        requestBody: { role: data.newRole },
        userId: user.id,
      }),
    onSuccess: () => {
      showSuccessToast("The role was updated successfully")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<TeamUpdateMember> = async () => {
    const newRole = userRole === "admin" ? "member" : "admin"
    mutation.mutate({ newRole })
  }

  return (
    <>
      <DialogRoot
        size={{ base: "xs", md: "md" }}
        role="alertdialog"
        placement="center"
      >
        <DialogTrigger asChild>
          <MenuItem value="change-role" cursor="pointer">
            <FaExchangeAlt fontSize="16px" />
            Change Role
          </MenuItem>
        </DialogTrigger>
        <DialogContent>
          <DialogCloseTrigger />
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Change Role</DialogTitle>
            </DialogHeader>
            <DialogBody>
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
                <Button
                  variant="solid"
                  type="submit"
                  loading={mutation.isPending}
                >
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

export default ChangeRole
