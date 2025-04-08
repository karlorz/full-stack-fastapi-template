import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import type { InvitationPublic } from "@/client"
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
  invitation: InvitationPublic | undefined
  invitationToken: string
}

const TeamInvitationNoAuth = ({
  invitation,
  invitationToken,
}: AcceptInvitationProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()

  const handleClose = () => {
    setIsOpen(false)
    navigate({
      to: "/login",
      search: { redirect: `/?invitation_token=${invitationToken}` },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Team Invitation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" data-testid="noauth-invitation">
          <DialogDescription asChild>
            <div>
              <p>
                Hi <span className="font-bold">{invitation?.email}</span>,
              </p>
              <p className="mt-4">
                You have been invited by{" "}
                <span className="font-bold">{invitation?.sender.email}</span> to
                join <span className="font-bold">{invitation?.team.name}</span>.
                Please log in, and if you're not registered yet, sign up to
                accept the invitation.
              </p>
            </div>
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Ok</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default TeamInvitationNoAuth
