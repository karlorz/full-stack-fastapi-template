import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useState } from "react"

import group from "@/assets/group.json"
import { type InvitationPublic, InvitationsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AcceptInvitationProps {
  token: string
  invitation: InvitationPublic | undefined
}

const AcceptInvitation = ({ token, invitation }: AcceptInvitationProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () =>
      InvitationsService.acceptInvitation({ requestBody: { token: token } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
      queryClient.invalidateQueries({ queryKey: ["teams"] })
    },
  })

  const handleJoinTeam = () => {
    if (!token) return
    mutation.mutate()
  }

  const handleClose = () => {
    setIsOpen(false)
    navigate({ to: "/" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        {mutation.isPending || mutation.isIdle ? (
          <>
            <DialogHeader>
              <DialogTitle>Team Invitation</DialogTitle>
              <DialogDescription
                className="space-y-4"
                data-testid="accept-invitation"
              >
                <p>
                  Hi <span className="font-bold">{invitation?.email}</span>,
                </p>
                <p>
                  You have been invited by{" "}
                  <span className="font-bold">{invitation?.sender.email}</span>{" "}
                  to join{" "}
                  <span className="font-bold">{invitation?.team.name}</span>.
                  Accept to build and deploy apps with the team.
                </p>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleJoinTeam}>Join Team</Button>
            </DialogFooter>
          </>
        ) : mutation.isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Invitation Accepted!</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center space-y-4">
              <Lottie
                animationData={group}
                loop={false}
                style={{ width: 75, height: 75 }}
              />
              <DialogDescription>
                You are now a member of{" "}
                <span className="font-bold">{invitation?.team.name}</span>. Now
                you can start building and deploying apps with the team.
              </DialogDescription>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Ok</Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
              <DialogDescription>
                An error occurred while processing your request. Please try
                again later.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleClose}>Ok</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AcceptInvitation
