import {
  Box,
  Button,
  Center,
  Container,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { type SubmitHandler, useForm } from "react-hook-form"

import confetti from "../../../../assets/confetti.json"
import warning from "../../../../assets/failed.json"
import { type ApiError, type AppCreate, AppsService } from "../../../../client"
import CustomCard from "../../../../components/Common/CustomCard"
import { extractErrorMessage, fetchTeamBySlug } from "../../../../utils"

export const Route = createFileRoute("/_layout/$team/apps/new")({
  component: NewApp,
  loader: ({ params }) => fetchTeamBySlug(params.team),
})

function NewApp() {
  const navigate = useNavigate()
  const team = Route.useLoaderData()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
      reset()
      onOpen()
    },
    onError: () => {
      onOpen()
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<AppCreate> = (data) => {
    mutation.mutate({ ...data, team_id: team.id })
  }

  return (
    <Container maxW="full" p={0}>
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
        {/* TODO: Complete when integration with Github is implemented */}
        {/* <CustomCard title="Source Code">
          <Text mb={4}>
            Connect your app to a source code repository to deploy it.
          </Text>
          <Button variant="outline" colorScheme="gray" leftIcon={<FaGithub />}>
            Connect
          </Button>
        </CustomCard> */}
        <Button my={4} type="submit" isLoading={isSubmitting} variant="primary">
          Create App
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          {mutation.isSuccess ? (
            <>
              <ModalHeader data-testid="app-created-success">
                App Created!
              </ModalHeader>
              <ModalBody>
                <Center>
                  <Lottie
                    animationData={confetti}
                    loop={false}
                    style={{ width: 75, height: 75 }}
                  />
                </Center>
                <Text my={4}>
                  Your team <b>{mutation.variables?.name}</b> has been created
                  successfully. Now you can start deploying your app.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => {
                    onClose()
                    navigate({
                      to: "/$team/apps/$app",
                      params: { team: team.slug, app: mutation.data?.slug },
                    })
                  }}
                  mt={2}
                >
                  Go to App
                </Button>
              </ModalFooter>
            </>
          ) : mutation.isError ? (
            <>
              <ModalHeader>App Creation Failed</ModalHeader>
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
                    color="error.base"
                    fontWeight="bold"
                    textAlign="center"
                    mt={4}
                  >
                    {extractErrorMessage(mutation.error as ApiError)}
                  </Text>
                )}
                <Text my={4}>
                  Oops! An error occurred while creating the app. Please try
                  again later. If the issue persists, contact our support team
                  for assistance.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button onClick={onClose} mt={4}>
                  Ok
                </Button>
              </ModalFooter>
            </>
          ) : null}
        </ModalContent>
      </Modal>
    </Container>
  )
}
