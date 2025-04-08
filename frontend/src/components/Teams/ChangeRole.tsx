import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeftRight } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type Role,
  type TeamUpdateMember,
  TeamsService,
  type UserPublic,
} from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

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
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Change Role
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>
              {userRole === "member" ? (
                <>
                  Are you sure you want to promote the user to{" "}
                  <span className="font-bold">Admin</span>?
                </>
              ) : (
                <>
                  Are you sure you want to demote the user to{" "}
                  <span className="font-bold">Member</span>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || mutation.isPending}>
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ChangeRole
