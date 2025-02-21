import { Box, Text } from "@chakra-ui/react"

import type { InvitationPublic, UserPublic } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import useAuth from "@/hooks/useAuth"
import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"

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
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      placement="center"
    >
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Oops!</DialogTitle>
        </DialogHeader>
        <DialogBody data-testid="no-matching-account">
          <Text>You are not the invited user for this invitation.</Text>
          <Box my={6} boxShadow="xs" px={8} py={4} borderRadius="lg">
            <Text>
              Logged in as: <strong>{currentUser?.email}</strong>
            </Text>
            <Text>
              Invited user: <strong>{invitation?.email}</strong>
            </Text>
          </Box>
          <Text>
            Please switch to the correct account to accept the invitation.
          </Text>
        </DialogBody>
        <DialogFooter gap={3}>
          <DialogActionTrigger>
            <Button variant="subtle" colorPalette="gray" onClick={handleClose}>
              Cancel
            </Button>
          </DialogActionTrigger>
          <DialogActionTrigger>
            <Button variant="solid" onClick={handleSwitchAccount}>
              Switch Account
            </Button>
          </DialogActionTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  )
}

export default NoMatchingAccount
