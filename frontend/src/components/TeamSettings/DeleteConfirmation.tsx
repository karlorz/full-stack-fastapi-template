import { Input, Text, VStack } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"

import { TeamsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { Route } from "@/routes/_layout/$team"
import { handleError } from "@/utils"
import { Alert } from "../ui/alert"
import { Button } from "../ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "../ui/dialog"
import { DialogRoot } from "../ui/dialog"
import { Field } from "../ui/field"

interface DeleteProps {
  teamId: string
}

interface DeleteInput {
  confirmation: string
}

const DeleteConfirmation = ({ teamId }: DeleteProps) => {
  const { team } = Route.useParams()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
    watch,
  } = useForm<DeleteInput>({
    mode: "onBlur",
    criteriaMode: "all",
  })
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      await TeamsService.deleteTeam({ teamId: teamId })
    },
    onSuccess: () => {
      showToast("Success", "The team was deleted successfully", "success")
      localStorage.removeItem("current_team")
      navigate({ to: "/" })
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
          Delete Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogCloseTrigger />
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-testid="delete-confirmation-team"
        >
          <DialogHeader as="h2">Delete Team</DialogHeader>
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
                This team will be <strong>permanently deleted.</strong>
              </Text>
              <Text>
                Type <strong>delete team {team}</strong> below to confirm and
                click the confirm button.
              </Text>

              <Field
                invalid={!!errors.confirmation}
                errorText={errors.confirmation?.message}
              >
                <Input
                  id="confirmation"
                  placeholder={`Type "delete team ${team}" to confirm`}
                  {...register("confirmation", {
                    required: "Field is required",
                    validate: (value) =>
                      value === `delete team ${team}`
                        ? true
                        : "Confirmation does not match",
                  })}
                  type="text"
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
                disabled={confirmationValue !== `delete team ${team}`}
              >
                Confirm
              </Button>
            </DialogActionTrigger>
          </DialogFooter>
        </form>
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteConfirmation
