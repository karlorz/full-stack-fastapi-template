import { Text } from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"

import type { InvitationPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog"
import { useState } from "react"

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
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      placement="center"
    >
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader as="h2">Team Invitation</DialogHeader>
        <DialogBody data-testid="noauth-invitation">
          <Text>
            Hi <strong>{invitation?.email},</strong>
          </Text>
          <Text my={4}>
            You have been invited by <strong>{invitation?.sender.email}</strong>{" "}
            to join <strong>{invitation?.team.name}</strong>. Please log in, and
            if you're not registered yet, sign up to accept the invitation.
          </Text>
        </DialogBody>
        <DialogFooter gap={3}>
          <DialogActionTrigger asChild>
            <Button variant="solid" onClick={handleClose}>
              Ok
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default TeamInvitationNoAuth
