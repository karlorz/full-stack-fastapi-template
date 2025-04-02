import { IconButton } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash } from "lucide-react"

import { type InvitationsData, InvitationsService } from "@/client/services"
import { Tooltip } from "@/components/ui/tooltip"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const CancelInvitation = ({ id }: { id: string }) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: async (data: InvitationsData["DeleteInvitation"]) => {
      await InvitationsService.deleteInvitation(data)
    },
    onSuccess: () => {
      showSuccessToast("The invitation was cancelled")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const handleCancel = () => {
    mutation.mutate({ invId: id })
  }

  return (
    <>
      <Tooltip content={"Cancel Invitation"}>
        <IconButton
          variant="ghost"
          color="inherit"
          onClick={handleCancel}
          data-testid="cancel-invitation"
          loading={mutation.isPending}
          aria-label="Cancel invitation"
        >
          <Trash />
        </IconButton>
      </Tooltip>
    </>
  )
}

export default CancelInvitation
