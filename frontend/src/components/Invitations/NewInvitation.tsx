import {
  Button,
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
import { type SubmitHandler, useForm } from "react-hook-form"

import { useState } from "react"
import {
  type ApiError,
  type InvitationCreate,
  InvitationsService,
} from "../../client"
import { Route } from "../../routes/_layout/$team"
import { emailPattern, extractErrorMessage } from "../../utils"

interface NewInvitationProps {
  isOpen: boolean
  onClose: () => void
}

const NewInvitation = ({ isOpen, onClose }: NewInvitationProps) => {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const { team: teamSlug } = Route.useParams()
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
      setStatus("success")
      reset()
    },
    onError: () => {
      setStatus("error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const onSubmit: SubmitHandler<InvitationCreate> = (data) => {
    setStatus("loading")
    const updatedData: InvitationCreate = {
      ...data,
      role: "member",
      team_slug: teamSlug,
    }
    mutation.mutate(updatedData)
  }

  const handleClose = () => {
    setStatus("idle")
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
        {status === "idle" || status === "loading" ? (
          <>
            <ModalHeader>Team Invitation</ModalHeader>
            <ModalCloseButton aria-label="Close invitation modal" />
            <ModalBody>
              <Text mb={4}>Invite someone to your team</Text>
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
                  type="text"
                  data-testid="invitation-email"
                />
                {errors.email && (
                  <Text id="email-error" color="red.500" mt={2}>
                    {errors.email.message}
                  </Text>
                )}
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                variant="secondary"
                type="submit"
                isLoading={isSubmitting}
                mt={4}
              >
                Send invitation
              </Button>
            </ModalFooter>
          </>
        ) : status === "success" ? (
          <>
            <ModalHeader>Success!</ModalHeader>
            <ModalCloseButton aria-label="Close invitation modal" />
            <ModalBody>
              <Text>
                The invitation has been sent to <b>{mutation.data?.email}</b>{" "}
                successfully. Now they just need to accept it.
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
            <ModalHeader>Error</ModalHeader>
            <ModalCloseButton aria-label="Close invitation modal" />
            <ModalBody>
              <Text>
                An error occurred while sending the invitation. Please try
                again.
              </Text>

              <Text color="red.500" mt={2}>
                {extractErrorMessage(mutation.error as ApiError)}
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
