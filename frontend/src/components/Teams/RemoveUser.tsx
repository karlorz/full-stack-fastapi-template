import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash } from "lucide-react"
import { useForm } from "react-hook-form"

import { type TeamsRemoveMemberFromTeamData, TeamsService } from "@/client"
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

interface RemoveProps {
  teamId?: string
  userId: string
}

const RemoveUser = ({ teamId, userId }: RemoveProps) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<TeamsRemoveMemberFromTeamData>()

  const mutation = useMutation({
    mutationFn: async (data: TeamsRemoveMemberFromTeamData) => {
      await TeamsService.removeMemberFromTeam(data)
    },
    onSuccess: () => {
      showSuccessToast("The user was removed successfully")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate({ teamId: teamId!, userId })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem className="text-destructive">
          <Trash className="h-4 w-4 mr-2" />
          Remove User
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription className="space-y-2">
              <p>
                This user will no longer have access to this team. All{" "}
                <span className="font-bold">
                  associated data and permissions will be revoked.
                </span>
              </p>
              <p>
                To restore access, you'll need to invite this user to the team
                again.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isSubmitting || mutation.isPending}
            >
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveUser
