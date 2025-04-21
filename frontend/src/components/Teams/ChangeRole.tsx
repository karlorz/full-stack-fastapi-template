import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ArrowLeftRight } from "lucide-react"
import { useState } from "react"

import { type Role, TeamsService, type UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { LoadingButton } from "@/components/ui/loading-button"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface ChangeRoleProps {
  userRole: Role
  teamId: string
  user: UserPublic
  onActionComplete: () => void
}

const ChangeRole = ({
  userRole,
  teamId,
  user,
  onActionComplete,
}: ChangeRoleProps) => {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (newRole: Role) =>
      TeamsService.updateMemberInTeam({
        teamId,
        userId: user.id,
        requestBody: { role: newRole },
      }),
    onSuccess: () => {
      showSuccessToast("Role updated successfully")
      setOpen(false)
      onActionComplete()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const handleChangeRole = () => {
    const newRole = userRole === "admin" ? "member" : "admin"
    mutation.mutate(newRole)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DropdownMenuItem
        onSelect={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
        className="flex items-center"
      >
        <ArrowLeftRight className="h-4 w-4 mr-2" />
        <span>Change Role</span>
      </DropdownMenuItem>

      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-2">
          <DialogTitle>Change Role</DialogTitle>
          <DialogDescription>
            {userRole === "member" ? (
              <>
                Promote <span className="font-semibold">{user.email}</span> to{" "}
                <span className="font-bold">Admin</span>?
              </>
            ) : (
              <>
                Demote <span className="font-semibold">{user.email}</span> to{" "}
                <span className="font-bold">Member</span>?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={mutation.isPending}
            className="sm:w-auto w-full"
          >
            Cancel
          </Button>
          <LoadingButton
            type="button"
            onClick={handleChangeRole}
            loading={mutation.isPending}
          >
            Confirm
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ChangeRole
