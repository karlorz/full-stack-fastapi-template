import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Trash } from "@/assets/icons.tsx"
import { type InvitationsData, InvitationsService } from "@/client/services"
import { Tooltip } from "@/components/ui/tooltip"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { IconButton } from "@chakra-ui/react"

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
      queryClient.invalidateQueries()
    },
  })

  const handleCancel = () => {
    mutation.mutate({ invId: id })
  }

  return (
    <>
      <Tooltip content="Cancel Invitation">
        <IconButton
          variant="ghost"
          color="inherit"
          onClick={() => handleCancel()}
          data-testid="cancel-invitation"
        >
          <Trash />
        </IconButton>
      </Tooltip>
    </>
  )
}

export default CancelInvitation
