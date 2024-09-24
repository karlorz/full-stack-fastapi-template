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

import confetti from "../../../assets/confetti.json"
import warning from "../../../assets/failed.json"
import { type ApiError, type TeamCreate, TeamsService } from "../../../client"
import CustomCard from "../../../components/Common/CustomCard"
import { extractErrorMessage } from "../../../utils"

export const Route = createFileRoute("/_layout/teams/new")({
  component: NewTeam,
})

function NewTeam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { isOpen, onOpen, onClose } = useDisclosure()

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
        {/* TODO: Complete when billing is implemented */}
        {/* <CustomCard title="Pricing Plan">
          <Plans />
        </CustomCard>
        <CustomCard title="Payment">
          <Button mt={2} mb={4}>
            Add card
          </Button>
        </CustomCard> */}
        <Button variant="primary" my={4} type="submit" isLoading={isSubmitting}>
          Create Team
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          {mutation.isSuccess ? (
            <>
              <ModalHeader>Team Created!</ModalHeader>
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
                  successfully. Now you can invite your team members and start
                  collaborating together.
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => {
                    onClose()
                    navigate({ to: "/teams/all" })
                  }}
                  mt={4}
                >
                  Ok
                </Button>
              </ModalFooter>
            </>
          ) : mutation.isError ? (
            <>
              <ModalHeader>Team Creation Failed</ModalHeader>
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
                    color="red.500"
                    fontWeight="bold"
                    textAlign="center"
                    mt={4}
                  >
                    {extractErrorMessage(mutation.error as ApiError)}
                  </Text>
                )}
                <Text my={4}>
                  Oops! An error occurred while creating the team. Please try
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
