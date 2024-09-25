import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"
import { useNavigate } from "@tanstack/react-router"

import type { InvitationPublic } from "@/client"

interface AcceptInvitationProps {
  isOpen: boolean
  onClose: () => void
  invitation: InvitationPublic | undefined
  invitationToken: string
}

const TeamInvitationNoAuth = ({
  isOpen,
  onClose,
  invitation,
  invitationToken,
}: AcceptInvitationProps) => {
  const navigate = useNavigate()

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Team Invitation</ModalHeader>
        <ModalCloseButton
          onClick={() => navigate({ to: "/" })}
          aria-label="Close invitation modal"
        />
        <ModalBody data-testid="noauth-invitation">
          <Text>
            Hi <strong>{invitation?.email},</strong>
          </Text>
          <Text my={4}>
            You have been invited by <strong>{invitation?.sender.email}</strong>{" "}
            to join <strong>{invitation?.team.name}</strong>. Please log in, and
            if you're not registered yet, sign up to accept the invitation.
          </Text>
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            onClick={() => {
              onClose()
              navigate({
                to: "/login",
                search: { redirect: `/?invitation_token=${invitationToken}` },
              })
            }}
          >
            Ok
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default TeamInvitationNoAuth
