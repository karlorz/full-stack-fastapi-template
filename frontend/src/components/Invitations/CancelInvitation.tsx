import { Button, Center, Tooltip } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { Trash } from "@/assets/icons.tsx"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { type InvitationsData, InvitationsService } from "../../client/services"

const CancelInvitation = ({ id }: { id: string }) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  const mutation = useMutation({
    mutationFn: async (data: InvitationsData["DeleteInvitation"]) => {
      await InvitationsService.deleteInvitation(data)
    },
    onSuccess: () => {
      showToast("Success", "The invitation was cancelled", "success")
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const handleCancel = () => {
    mutation.mutate({ invId: id })
  }

  return (
    <>
      <Tooltip label="Cancel Invitation">
        <Button onClick={() => handleCancel()} data-testid="cancel-invitation">
          <Center>
            <Trash />
          </Center>
        </Button>
      </Tooltip>
    </>
  )
}

export default CancelInvitation
