import { Box, Center, Container, Heading, Input, Text } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import confetti from "@/assets/confetti.json"
import warning from "@/assets/failed.json"
import { type ApiError, type TeamCreate, TeamsService } from "@/client"
import CustomCard from "@/components/Common/CustomCard"
import { Button } from "@/components/ui/button"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import { extractErrorMessage } from "@/utils"

export const Route = createFileRoute("/_layout/teams/new")({
  component: NewTeam,
})

function NewTeam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

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
      setIsOpen(true)
    },
    onError: () => {
      setIsOpen(true)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<TeamCreate> = (data) => {
    mutation.mutate(data)
  }

  const handleClose = () => {
    setIsOpen(false)
    navigate({ to: "/" })
  }

  const handleInviteMembers = () => {
    setIsOpen(false)
    navigate({
      to: "/$team/settings",
      params: { team: mutation.data?.slug },
    })
  }

  return (
    <Container maxW="full" p={0}>
      <Heading size="xl" textAlign={{ base: "center", md: "left" }}>
        New Team
      </Heading>
      <Box pt={10}>
        <CustomCard title="Name">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Field invalid={!!errors.name} errorText={errors.name?.message}>
              <Input
                placeholder="Team Name"
                width="auto"
                minLength={3}
                {...register("name", { required: "Name is required" })}
              />
            </Field>
            <Button variant="solid" my={4} type="submit" loading={isSubmitting}>
              Create Team
            </Button>
          </form>
        </CustomCard>
        {/* TODO: Complete when billing is implemented */}
        {/* <CustomCard title="Pricing Plan">
          <Plans />
        </CustomCard>
        <CustomCard title="Payment">
          <Button variant="secondary" mt={2} mb={4}>
            Add card
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
              <DialogHeader as="h2">Team Created!</DialogHeader>
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
                  successfully. Now you can invite your team members and start
                  collaborating together.
                </Text>
              </DialogBody>
              <DialogFooter gap={2}>
                <Button variant="solid" onClick={handleInviteMembers} mt={4}>
                  Invite Members
                </Button>
              </DialogFooter>
            </>
          ) : mutation.isError ? (
            <>
              <DialogHeader as="h2">Team Creation Failed</DialogHeader>
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
                  Oops! An error occurred while creating the team. Please try
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
