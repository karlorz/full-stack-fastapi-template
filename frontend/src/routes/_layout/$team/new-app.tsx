import { Box, Center, Container, Heading, Input, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import confetti from "@/assets/confetti.json"
import warning from "@/assets/failed.json"
import { type ApiError, type AppCreate, AppsService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import { Button } from "@/components/ui/button"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { extractErrorMessage, fetchTeamBySlug } from "@/utils"

export const Route = createFileRoute("/_layout/$team/new-app")({
  component: NewApp,
  loader: ({ params }) => fetchTeamBySlug(params.team),
})

function NewApp() {
  const navigate = useNavigate()
  const team = Route.useLoaderData()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppCreate>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: AppCreate) =>
      AppsService.createApp({ requestBody: data }),
    onSuccess: () => {
      reset()
      setIsOpen(true)
    },
    onError: () => {
      setIsOpen(true)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<AppCreate> = (data) => {
    mutation.mutate({ ...data, team_id: team.id })
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Container maxW="full" p={0}>
      <Heading size="xl" textAlign={{ base: "center", md: "left" }}>
        New App
      </Heading>
      <Box pt={10}>
        <CustomCard title="Name">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Field invalid={!!errors.name} errorText={errors.name?.message}>
              <Input
                placeholder="App Name"
                width="auto"
                minLength={3}
                {...register("name", { required: "Name is required" })}
              />
            </Field>
            <Button
              my={4}
              type="submit"
              loading={mutation.isPending}
              variant="solid"
            >
              Create App
            </Button>
          </form>
        </CustomCard>
        {/* TODO: Complete when integration with Github is implemented */}
        {/* <CustomCard title="Source Code">
            <Text mb={4}>
              Connect your app to a source code repository to deploy it.
            </Text>
            <Button variant="secondary" colorScheme="gray" leftIcon={<FaGithub />}>
              Connect
            </Button>
          </CustomCard> */}
      </Box>

      <DialogRoot
        size={{ base: "xs", md: "md" }}
        open={isOpen}
        onOpenChange={(e) => setIsOpen(e.open)}
        placement="center"
      >
        <DialogContent>
          <DialogCloseTrigger />
          {mutation.isSuccess ? (
            <>
              <DialogHeader data-testid="app-created-success">
                <DialogTitle>App Created!</DialogTitle>
              </DialogHeader>
              <DialogBody>
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
              </DialogBody>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    navigate({
                      to: "/$team/apps/$app",
                      params: { team: team.slug, app: mutation.data?.slug },
                    })
                  }}
                  mt={2}
                >
                  Go to App
                </Button>
              </DialogFooter>
            </>
          ) : mutation.isError ? (
            <>
              <DialogHeader>
                <DialogTitle>App Creation Failed</DialogTitle>
              </DialogHeader>
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
                  Oops! An error occurred while creating the app. Please try
                  again later. If the issue persists, contact our support team
                  for assistance.
                </Text>
              </DialogBody>
              <DialogFooter>
                <Button variant="solid" onClick={handleClose} mt={4}>
                  Ok
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </DialogRoot>
    </Container>
  )
}
