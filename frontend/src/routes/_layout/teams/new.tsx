import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type TeamCreate, TeamsService } from "../../../client"
import Plans from "../../../components/Billing/Plans"
import CustomCard from "../../../components/Common/CustomCard"
import useCustomToast from "../../../hooks/useCustomToast"
import { handleError } from "../../../utils"

export const Route = createFileRoute("/_layout/teams/new")({
  component: NewTeam,
})

function NewTeam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeamCreate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: TeamCreate) =>
      TeamsService.createTeam({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Team created successfully", "success")
      reset()
      navigate({ to: "/teams/all" })
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<TeamCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }}>
        New Team
      </Heading>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} pt={10}>
        <CustomCard title="Name">
          <FormLabel fontWeight="bold" mb={4} srOnly>
            Name
          </FormLabel>
          <FormControl isInvalid={!!errors.name}>
            <Input
              placeholder="Team Name"
              width="auto"
              minLength={3}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <FormErrorMessage>{errors.name.message}</FormErrorMessage>
            )}
          </FormControl>
        </CustomCard>
        <CustomCard title="Pricing Plan">
          <Plans />
        </CustomCard>
        <CustomCard title="Payment">
          <Button mt={2} mb={4}>
            Add card
          </Button>
        </CustomCard>
        <Button variant="primary" my={4} type="submit" isLoading={isSubmitting}>
          Create Team
        </Button>
      </Box>
    </Container>
  )
}
