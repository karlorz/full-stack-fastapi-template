import { Center, Input, Text } from "@chakra-ui/react"
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
import { Button } from "@/components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { emailPattern, extractErrorMessage } from "@/utils"

interface NewInvitationProps {
  teamId: string
}

const NewInvitation = ({ teamId }: NewInvitationProps) => {
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
    onSuccess: () => reset(),
    onError: () => reset(),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["invitations"] }),
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
    reset()
  }

  return (
    <DialogContent>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogCloseTrigger />
        {mutation.isPending || mutation.isIdle ? (
          <>
            <DialogHeader as="h2">Team Invitation</DialogHeader>
            <DialogBody>
              <Text mb={4}>
                Fill in the email address to invite someone to your team.
              </Text>
              <Field
                required
                invalid={!!errors.email}
                errorText={errors.email?.message}
              >
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
              </Field>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="solid"
                type="submit"
                loading={isSubmitting || mutation.isPending}
                mt={4}
              >
                Send Invitation
              </Button>
            </DialogFooter>
          </>
        ) : mutation.isSuccess ? (
          <>
            <DialogHeader>Invitation Sent!</DialogHeader>
            <DialogBody>
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
                You can manage invitations from your team dashboard or send
                another one.
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
        ) : (
          <>
            <DialogHeader>Invitation Failed</DialogHeader>
            <DialogBody>
              <Center>
                <Lottie
                  animationData={warning}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </Center>
              {mutation.error && (
                <Text
                  color="error.base"
                  fontWeight="bold"
                  textAlign="center"
                  mt={4}
                >
                  {extractErrorMessage(mutation.error as ApiError)}
                </Text>
              )}
              <Text my={4}>
                Oops! Something went wrong while sending the invitation. Please
                try again or double-check the information.
              </Text>
              <Text mt={2}>
                If the problem continues, please contact our support team.
              </Text>
            </DialogBody>
            <DialogFooter>
              <Button variant="solid" mt={4} onClick={handleClose}>
                Ok
              </Button>
            </DialogFooter>
          </>
        )}
      </form>
    </DialogContent>
  )
}

export default NewInvitation
