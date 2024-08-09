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
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { type InvitationPublic, InvitationsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"

interface AcceptInvitationProps {
  isOpen: boolean
  onClose: () => void
  token: string
  invitation: InvitationPublic | undefined
}

const AcceptInvitation = ({
  isOpen,
  onClose,
  token,
  invitation,
}: AcceptInvitationProps) => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () =>
      InvitationsService.acceptInvitation({ requestBody: { token: token } }),
    onSuccess: () => {
      showToast(
        "Success!",
        `You are now a member of ${invitation?.team.name}`,
        "success",
      )
      navigate({ to: "/teams/all" })
      onClose()
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const handleJoinTeam = () => {
    mutation.mutate()
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
        <ModalHeader>Team Invitation</ModalHeader>
        <ModalCloseButton
          onClick={() => navigate({ to: "/" })}
          aria-label="Close invitation modal"
        />
        <ModalBody data-testid="accept-invitation">
          <Text>
            Hi <strong>{invitation?.email},</strong>
          </Text>
          <Text my={4}>
            You have been invited by <strong>{invitation?.sender.email}</strong>{" "}
            to join <strong>{invitation?.team.name}</strong>. Accept to build
            and deploy apps with the team.
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
          <Button variant="primary" onClick={handleJoinTeam}>
            Join team
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default AcceptInvitation
