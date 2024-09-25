import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"

import type { InvitationPublic, UserPublic } from "@/client"
import useAuth from "@/hooks/useAuth"
import { useNavigate } from "@tanstack/react-router"

interface NoMatchingAccountProps {
  isOpen: boolean
  onClose: () => void
  invitation: InvitationPublic | undefined
  currentUser: UserPublic | null | undefined
}

const NoMatchingAccount = ({
  isOpen,
  onClose,
  invitation,
  currentUser,
}: NoMatchingAccountProps) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const url = window.location.pathname + window.location.search
  const urlEncoded = encodeURIComponent(url)

  const handleSwitchAccount = () => {
    logout(urlEncoded)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex alignItems="center">
            <Text mr={2}>Oops!</Text>
          </Flex>
        </ModalHeader>
        <ModalCloseButton
          onClick={() => navigate({ to: "/" })}
          aria-label="Close invitation modal"
        />
        <ModalBody data-testid="no-matching-account">
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
        </ModalBody>
        <ModalFooter gap={3}>
          <Button
            variant="outline"
            onClick={() => {
              onClose()
              navigate({ to: "/" })
            }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSwitchAccount}>
            Switch Account
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default NoMatchingAccount
