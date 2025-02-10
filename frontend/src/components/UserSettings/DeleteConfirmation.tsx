import { Input, Text, VStack } from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"

import { TeamsService, UsersService } from "../../client"
import useAuth from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import { handleError } from "../../utils"
import { Alert } from "../ui/alert"
import { Button } from "../ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"

interface DeleteInput {
  confirmation: string
}

const DeleteConfirmation = () => {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<DeleteInput>()
  const showToast = useCustomToast()
  const { logout } = useAuth()

  const { data: userTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () =>
      TeamsService.readTeams({
        owner: true,
      }),
  })

  const nonPersonalUserTeams = userTeams?.data?.filter(
    (team) => team.is_personal_team === false,
  )
  const ownsTeams = (nonPersonalUserTeams?.length ?? 0) > 0

  const mutation = useMutation({
    mutationFn: async () => {
      await UsersService.deleteUserMe()
    },
    onSuccess: () => {
      showToast("Success", "Your account was deleted successfully", "success")
      logout()
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  const confirmationValue = watch("confirmation")

  return (
    <DialogRoot
      size={{ base: "xs", md: "md" }}
      role="alertdialog"
      placement="center"
    >
      <DialogTrigger asChild>
        <Button
          variant="solid"
          colorPalette="red"
          display={{ base: "block", md: "inline-block" }}
          mt={{ base: 4, md: 0 }}
          alignSelf={{ base: "flex-start", md: "auto" }}
        >
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogCloseTrigger />
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-testid="delete-confirmation-user"
        >
          <DialogHeader as="h2">Delete Account</DialogHeader>
          {ownsTeams ? (
            <>
              <DialogBody>
                <Alert
                  status="warning"
                  borderRadius="md"
                  color="warning.base"
                  title="Warning: This action cannot be undone."
                />
                <Text my={4}>
                  You must remove or transfer ownership of your teams before
                  deleting your account. Please visit the{" "}
                  <RouterLink className="main-link" to="/teams/all">
                    teams page
                  </RouterLink>{" "}
                  to manage your teams.
                </Text>
              </DialogBody>

              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="solid">Ok</Button>
                </DialogActionTrigger>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogBody>
                <VStack gap={4}>
                  <Alert
                    status="warning"
                    borderRadius="md"
                    color="warning.base"
                    title="Warning: This action cannot be undone."
                  />
                  {/* TODO: Update this text when the other features are completed*/}
                  <Text w="100%">
                    All your account data will be{" "}
                    <strong>permanently deleted.</strong>
                  </Text>
                  <Text>
                    Type <strong>delete my account</strong> below to confirm and
                    click the confirm button.
                  </Text>
                  <Field
                    invalid={!!errors.confirmation}
                    errorText={errors.confirmation?.message}
                  >
                    <Input
                      id="confirmation"
                      placeholder={`Type "delete my account" to confirm`}
                      {...register("confirmation", {
                        required: "Field is required",
                        validate: (value) =>
                          value === "delete my account"
                            ? true
                            : "Confirmation does not match",
                      })}
                    />
                  </Field>
                </VStack>
              </DialogBody>
              <DialogFooter gap={3}>
                <DialogActionTrigger asChild>
                  <Button
                    variant="subtle"
                    colorPalette="gray"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </DialogActionTrigger>
                <DialogActionTrigger asChild>
                  <Button
                    variant="solid"
                    colorPalette="red"
                    type="submit"
                    disabled={confirmationValue !== "delete my account"}
                  >
                    Confirm
                  </Button>
                </DialogActionTrigger>
              </DialogFooter>
            </>
          )}
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteConfirmation
