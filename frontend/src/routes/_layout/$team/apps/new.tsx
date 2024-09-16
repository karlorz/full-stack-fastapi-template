import {
  Box,
  Button,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"

import { FaGithub } from "react-icons/fa"
import { type AppCreate, AppsService } from "../../../../client"
import CustomCard from "../../../../components/Common/CustomCard"
import useCustomToast from "../../../../hooks/useCustomToast"
import { handleError } from "../../../../utils"

export const Route = createFileRoute("/_layout/$team/apps/new")({
  component: NewApp,
})

function NewApp() {
  const navigate = useNavigate()
  const { team } = Route.useParams()
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AppCreate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: AppCreate) =>
      AppsService.createApp({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "App created successfully", "success")
      reset()
      navigate({ to: "/$team/apps", params: { team } })
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<AppCreate> = (data) => {
    mutation.mutate({ ...data, team_slug: team })
  }

  return (
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }}>
        New App
      </Heading>
      <Box as="form" onSubmit={handleSubmit(onSubmit)} pt={10}>
        <CustomCard title="Name">
          <FormLabel fontWeight="bold" mb={4} srOnly>
            Name
          </FormLabel>
          <FormControl isInvalid={!!errors.name}>
            <Input
              placeholder="App Name"
              width="auto"
              minLength={3}
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <FormErrorMessage>{errors.name.message}</FormErrorMessage>
            )}
          </FormControl>
        </CustomCard>
        <CustomCard title="Source Code">
          <Text mb={4}>
            Connect your app to a source code repository to deploy it.
          </Text>
          <Button variant="outline" colorScheme="gray" leftIcon={<FaGithub />}>
            Connect
          </Button>
        </CustomCard>
        <Button my={4} type="submit" isLoading={isSubmitting} variant="primary">
          Create App
        </Button>
      </Box>
    </Container>
  )
}
