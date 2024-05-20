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
import { emailPattern } from "../../utils"

const NewInvitation = () => {
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
      showToast("Success!", "Invitation created successfully.", "success")
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
      // TODO: Update this to use the actual team_id
      team_id: 1,
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
      <Box as="form" onSubmit={handleSubmit(onSubmit)}>
        <Text>Invite someone to join your team.</Text>
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
            my={4}
          />
          {errors.email && (
            <FormErrorMessage>{errors.email.message}</FormErrorMessage>
          )}
        </FormControl>
        <Button variant="primary" type="submit" isLoading={isSubmitting}>
          Send invitation
        </Button>
      </Box>
    </Flex>
  )
}

export default NewInvitation
