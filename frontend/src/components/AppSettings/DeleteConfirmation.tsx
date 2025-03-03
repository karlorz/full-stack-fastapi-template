import { Alert, Input, Text, VStack } from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"

import { AppsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field } from "@/components/ui/field"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

interface DeleteProps {
  appId: string
  appSlug: string
}

interface DeleteInput {
  confirmation: string
}

const DeleteConfirmation = ({ appId, appSlug }: DeleteProps) => {
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
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: async () => {
      await AppsService.deleteApp({ appId })
    },
    onSuccess: () => {
      showSuccessToast("The app was deleted successfully")
      navigate({ to: "/" })
    },
    onError: handleError.bind(showErrorToast),
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
          Delete App
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogCloseTrigger />
        <form
          onSubmit={handleSubmit(onSubmit)}
          data-testid="delete-confirmation-app"
        >
          <DialogHeader>
            <DialogTitle>Delete App</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <VStack gap={4}>
              <Alert.Root status="warning">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Title>
                    Warning: This action cannot be undone.
                  </Alert.Title>
                </Alert.Content>
              </Alert.Root>
              {/* TODO: Update this text when the other features are completed*/}
              <Text w="100%">
                This app will be <strong>permanently deleted.</strong>
              </Text>
              <Text>
                Type <strong>delete app {appSlug}</strong> below to confirm and
                click the confirm button.
              </Text>

              <Field
                invalid={!!errors.confirmation}
                errorText={errors.confirmation?.message}
              >
                <Input
                  placeholder={`Type "delete app ${appSlug}" to confirm`}
                  id="confirmation"
                  {...register("confirmation", {
                    required: "Field is required",
                    validate: (value) =>
                      value === `delete app ${appSlug}`
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
                disabled={isSubmitting}
                variant="subtle"
                colorPalette="gray"
              >
                Cancel
              </Button>
            </DialogActionTrigger>
            <DialogActionTrigger asChild>
              <Button
                variant="solid"
                colorPalette="red"
                type="submit"
                disabled={confirmationValue !== `delete app ${appSlug}`}
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
