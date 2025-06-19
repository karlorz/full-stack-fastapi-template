import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash } from "lucide-react"

import { InvitationsService } from "@/client/sdk.gen"
import type { InvitationsDeleteInvitationData } from "@/client/types.gen"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useCustomToast from "@/hooks/useCustomToast"
import { cn } from "@/lib/utils"
import { handleError } from "@/utils"

const CancelInvitation = ({ id }: { id: string }) => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (data: InvitationsDeleteInvitationData) =>
      InvitationsService.deleteInvitation(data),
    onSuccess: () => {
      showSuccessToast("The invitation was cancelled")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["invitations"] }),
  })

  const handleCancel = () => {
    mutation.mutate({ invId: id })
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            data-testid="cancel-invitation"
            disabled={mutation.isPending}
            className={cn(
              "h-8 w-8",
              mutation.isPending && "cursor-not-allowed opacity-50",
            )}
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Cancel invitation</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Cancel Invitation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default CancelInvitation
