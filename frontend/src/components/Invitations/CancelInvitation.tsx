import { Button, Center, Tooltip } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FaTimes } from "react-icons/fa"

import {
  InvitationsService,
  type TDataDeleteInvitation,
} from "../../client/services"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

const CancelInvitation = ({ id }: { id: string }) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()

  const mutation = useMutation({
    mutationFn: async (data: TDataDeleteInvitation) => {
      await InvitationsService.deleteInvitation(data)
    },
    onSuccess: () => {
      showToast("Success", "The invitation was cancelled.", "success")
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
        <Button
          variant="unstyled"
          onClick={() => handleCancel()}
          data-testid="cancel-invitation"
        >
          <Center>
            <FaTimes />
          </Center>
        </Button>
      </Tooltip>
    </>
  )
}

export default CancelInvitation
