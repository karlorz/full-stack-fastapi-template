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

import {
  type ApiError,
  type OrganizationCreate,
  OrganizationsService,
} from "../../../client"
import Plans from "../../../components/Billing/Plans"
import useCustomToast from "../../../hooks/useCustomToast"

export const Route = createFileRoute("/_layout/organizations/new")({
  component: NewOrg,
})

function NewOrg() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationCreate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: OrganizationCreate) =>
      OrganizationsService.createOrganization({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Organization created successfully.", "success")
      reset()
      navigate({ to: "/organizations/all" })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["organizations"] })
    },
  })

  const onSubmit: SubmitHandler<OrganizationCreate> = (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Container maxW="full" p={12}>
        <Heading size="md" textAlign={{ base: "center", md: "left" }}>
          New Organization
        </Heading>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <Box>
            <Heading
              size="sm"
              textAlign={{ base: "center", md: "left" }}
              mt={4}
            >
              Details
            </Heading>
            <FormLabel mt={2}>Name</FormLabel>
            <FormControl isInvalid={!!errors.name}>
              <Input
                placeholder="Name"
                width="auto"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && (
                <FormErrorMessage>{errors.name.message}</FormErrorMessage>
              )}
            </FormControl>
          </Box>
          <Box>
            <Heading
              size="sm"
              textAlign={{ base: "center", md: "left" }}
              mt={4}
            >
              Plan
            </Heading>
            <FormLabel mt={2}>Pricing plan</FormLabel>
            <Plans />
          </Box>
          <Box>
            <Heading
              size="sm"
              textAlign={{ base: "center", md: "left" }}
              mt={4}
            >
              Payment
            </Heading>
            <Button color="ui.defaultText" mt={2} mb={4}>
              Add card
            </Button>
          </Box>
          <Button
            variant="primary"
            my={4}
            type="submit"
            isLoading={isSubmitting}
          >
            Create Organization
          </Button>
        </Box>
      </Container>
    </>
  )
}
