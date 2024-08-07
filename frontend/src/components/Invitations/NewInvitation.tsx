import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import {
  type ApiError,
  type InvitationCreate,
  InvitationsService,
} from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { Route } from "../../routes/_layout/$team"
import { emailPattern } from "../../utils"

const NewInvitation = () => {
  const { team: teamSlug } = Route.useParams()
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
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
      showToast("Success!", "Invitation sent successfully.", "success")
      reset()
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const onSubmit: SubmitHandler<InvitationCreate> = (data) => {
    const updatedData: InvitationCreate = {
      ...data,
      role: "member",
      team_slug: teamSlug,
    }
    mutation.mutate(updatedData)
  }

  return (
    <Flex
      textAlign={{ base: "center", md: "left" }}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        data-testid="new-invitation"
      >
        <Text mb={4}>Invite someone to join your team.</Text>
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
            w="auto"
            data-testid="invitation-email"
          />
          {errors.email && (
            <FormErrorMessage>{errors.email.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button variant="primary" type="submit" isLoading={isSubmitting} mt={4}>
          Send invitation
        </Button>
      </Box>
    </Flex>
  )
}

export default NewInvitation
