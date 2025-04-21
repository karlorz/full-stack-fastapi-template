import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash } from "lucide-react"
import { useState } from "react"

import { TeamsService } from "@/client"
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
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface RemoveProps {
  teamId: string
  userId: string
  onActionComplete: () => void
}

const RemoveUser = ({ teamId, userId, onActionComplete }: RemoveProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: () => TeamsService.removeMemberFromTeam({ teamId, userId }),
    onSuccess: () => {
      showSuccessToast("The user was removed successfully")
      setOpen(false)
      onActionComplete()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const handleRemove = () => {
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem
          className="flex items-center"
          onSelect={(e) => {
            e.preventDefault()
            setOpen(true)
          }}
        >
          <Trash className="h-4 w-4 mr-2 text-destructive" />
          <span className="text-destructive">Remove User</span>
        </DropdownMenuItem>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle>Remove User</DialogTitle>
          <DialogDescription>
            This user will no longer have access to this team. All{" "}
            <span className="font-bold">
              associated data and permissions will be revoked.
            </span>
            To restore access, you'll need to invite this user again.
          </DialogDescription>
        </DialogHeader>

        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to remove user. Please try again.
          </p>
        )}

        <DialogFooter className="sm:justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => setOpen(false)}
            className="sm:w-auto w-full"
          >
            Cancel
          </Button>
          <LoadingButton
            type="button"
            onClick={handleRemove}
            variant="destructive"
            loading={mutation.isPending}
          >
            Confirm
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RemoveUser
