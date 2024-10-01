import {
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
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
import Lottie from "lottie-react"
import { type SubmitHandler, useForm } from "react-hook-form"

import emailSent from "@/assets/email.json"
import warning from "@/assets/failed.json"
import {
  type ApiError,
  type InvitationCreate,
  InvitationsService,
} from "@/client"
import { emailPattern, extractErrorMessage } from "@/utils"

interface NewInvitationProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
}

const NewInvitation = ({ isOpen, onClose, teamId }: NewInvitationProps) => {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InvitationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: InvitationCreate) =>
      InvitationsService.createInvitation({ requestBody: data }),
    onSuccess: () => {
      reset()
    },
    onError: () => {
      reset()
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const onSubmit: SubmitHandler<InvitationCreate> = (data) => {
    const updatedData: InvitationCreate = {
      ...data,
      role: "member",
      team_id: teamId,
    }
    mutation.mutate(updatedData)
  }

  const handleClose = () => {
    mutation.reset()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size={{ base: "sm", md: "md" }}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        data-testid="new-invitation"
      >
        {mutation.isPending || mutation.isIdle ? (
          <>
            <ModalHeader>Team Invitation</ModalHeader>
            <ModalCloseButton aria-label="Close invitation modal" />
            <ModalBody>
              <Text mb={4}>
                Fill in the email address to invite someone to your team.
              </Text>
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel htmlFor="email" hidden>
                  Email address
                </FormLabel>
                <Input
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  placeholder="Email address"
                  type="email"
                  data-testid="invitation-email"
                />
                {errors.email && (
                  <Text id="email-error" color="ui.danger" mt={2}>
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="primary"
                type="submit"
                isLoading={isSubmitting || mutation.isPending}
                mt={4}
              >
                Send invitation
              </Button>
            </ModalFooter>
          </>
        ) : mutation.isSuccess ? (
          <>
            <ModalHeader>Invitation Sent!</ModalHeader>
            <ModalCloseButton aria-label="Close invitation modal" />
            <ModalBody>
              <Center>
                <Lottie
                  animationData={emailSent}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </Center>
              <Text my={4}>
                The invitation has been sent to <b>{mutation.data?.email}</b>.
                They just need to accept it to join your team.
              </Text>
              <Text mt={2}>
                You can manage the invitation from your team dashboard or send
                another one.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button onClick={handleClose} mt={4}>
                Ok
              </Button>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalHeader>Invitation Failed</ModalHeader>
            <ModalCloseButton aria-label="Close invitation modal" />
            <ModalBody>
              <Center>
                <Lottie
                  animationData={warning}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </Center>
              {mutation.error && (
                <Text
                  color="ui.danger"
                  fontWeight="bold"
                  textAlign="center"
                  mt={4}
                >
                  {extractErrorMessage(mutation.error as ApiError)}
                </Text>
              )}
              <Text my={4}>
                Oops! Something went wrong while sending the invitation. Please
                try again, or double-check the information you've entered.
              </Text>
              <Text mt={2}>
                If the problem continues, please contact our support team.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button onClick={handleClose} mt={4}>
                Ok
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default NewInvitation
