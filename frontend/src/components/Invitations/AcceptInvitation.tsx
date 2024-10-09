import {
  Button,
  Center,
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
import Lottie from "lottie-react"

import group from "@/assets/group.json"
import { type InvitationPublic, InvitationsService } from "@/client"

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
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: () =>
      InvitationsService.acceptInvitation({ requestBody: { token: token } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const handleJoinTeam = () => {
    if (!token) return
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
        {mutation.isPending || mutation.isIdle ? (
          <>
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
                You have been invited by{" "}
                <strong>{invitation?.sender.email}</strong> to join{" "}
                <strong>{invitation?.team.name}</strong>. Accept to build and
                deploy apps with the team.
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
          </>
        ) : mutation.isSuccess ? (
          <>
            <ModalHeader>Invitation Accepted!</ModalHeader>
            <ModalBody>
              <Center>
                <Lottie
                  animationData={group}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </Center>
              <Text>
                You are now a member of <strong>{invitation?.team.name}</strong>
                . Now you can start building and deploying apps with the team.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={onClose}>
                Ok
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>Error</ModalHeader>
            <ModalBody>
              <Text>
                An error occurred while processing your request. Please try
                again later.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="primary" onClick={onClose}>
                Ok
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AcceptInvitation
