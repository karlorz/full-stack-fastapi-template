import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

import type { InvitationPublic, UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import useAuth from "@/hooks/useAuth"

interface NoMatchingAccountProps {
  invitation: InvitationPublic | undefined
  currentUser: UserPublic | null | undefined
}

const NoMatchingAccount = ({
  invitation,
  currentUser,
}: NoMatchingAccountProps) => {
  const [isOpen, setIsOpen] = useState(true)
  const navigate = useNavigate()
  const { logout } = useAuth()
  const url = window.location.pathname + window.location.search
  const urlEncoded = encodeURIComponent(url)

  const handleSwitchAccount = () => {
    logout(urlEncoded)
  }

  const handleClose = () => {
    setIsOpen(false)
    navigate({ to: "/" })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Oops!</DialogTitle>
        </DialogHeader>
        <div className="space-y-4" data-testid="no-matching-account">
          <DialogDescription>
            You are not the invited user for this invitation.
          </DialogDescription>
          <div className="my-6 rounded-lg border p-4 shadow-sm">
            <p>
              Logged in as:{" "}
              <span className="font-bold">{currentUser?.email}</span>
            </p>
            <p>
              Invited user:{" "}
              <span className="font-bold">{invitation?.email}</span>
            </p>
          </div>
          <DialogDescription>
            Please switch to the correct account to accept the invitation.
          </DialogDescription>
        </div>
        <DialogFooter className="gap-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSwitchAccount}>Switch Account</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default NoMatchingAccount
