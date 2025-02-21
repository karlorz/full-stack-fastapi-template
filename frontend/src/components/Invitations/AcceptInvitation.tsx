import { Center, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"

import group from "@/assets/group.json"
import { type InvitationPublic, InvitationsService } from "@/client"
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
import { useState } from "react"

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
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      placement="center"
    >
      <DialogContent>
        <DialogCloseTrigger />
        {mutation.isPending || mutation.isIdle ? (
          <>
            <DialogHeader>
              <DialogTitle>Team Invitation</DialogTitle>
            </DialogHeader>
            <DialogBody data-testid="accept-invitation">
              <Text>
                Hi <strong>{invitation?.email},</strong>
              </Text>
              <Text my={4}>
                You have been invited by{" "}
                <strong>{invitation?.sender.email}</strong> to join{" "}
                <strong>{invitation?.team.name}</strong>. Accept to build and
                deploy apps with the team.
              </Text>
            </DialogBody>
            <DialogFooter gap={3}>
              <DialogActionTrigger asChild>
                <Button
                  variant="subtle"
                  colorPalette="gray"
                  onClick={handleClose}
                >
                  Cancel
                </Button>
              </DialogActionTrigger>
              <Button variant="solid" onClick={handleJoinTeam}>
                Join Team
              </Button>
            </DialogFooter>
          </>
        ) : mutation.isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Invitation Accepted!</DialogTitle>
            </DialogHeader>
            <DialogBody>
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
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger>
                <Button variant="solid" onClick={handleClose}>
                  Ok
                </Button>
              </DialogActionTrigger>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Error</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Text>
                An error occurred while processing your request. Please try
                again later.
              </Text>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="solid" onClick={handleClose}>
                  Ok
                </Button>
              </DialogActionTrigger>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  )
}

export default AcceptInvitation
