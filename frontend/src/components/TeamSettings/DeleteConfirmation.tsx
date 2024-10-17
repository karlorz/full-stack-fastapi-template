import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  AlertTitle,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useRef } from "react"
import { useForm } from "react-hook-form"

import { TeamsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { Route } from "@/routes/_layout/$team"
import { handleError } from "@/utils"

interface DeleteProps {
  teamId: string
  isOpen: boolean
  onClose: () => void
}

interface DeleteInput {
  confirmation: string
}

const DeleteConfirmation = ({ teamId, isOpen, onClose }: DeleteProps) => {
  const cancelRef = useRef<HTMLButtonElement | null>(null)
  const { team } = Route.useParams()
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
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
      onClose()
      navigate({ to: "/teams/all" })
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        leastDestructiveRef={cancelRef}
        size={{ base: "sm", md: "md" }}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            data-testid="delete-confirmation-team"
          >
            <AlertDialogHeader>Delete Team</AlertDialogHeader>
            <AlertDialogBody>
              <VStack spacing={4}>
                <Alert status="warning" borderRadius="md" color="warning.base">
                  <AlertIcon color="warning.base" />
                  <AlertTitle mr={2}>Warning:</AlertTitle>
                  This action cannot be undone.
                </Alert>
                {/* TODO: Update this text when the other features are completed*/}
                <Text w="100%">
                  This team will be <strong>permanently deleted.</strong>
                </Text>
                <Text>
                  Type <strong>delete team {team}</strong> below to confirm and
                  click the confirm button.
                </Text>
                <FormControl
                  id="confirmation"
                  isInvalid={!!errors.confirmation}
                >
                  <FormLabel htmlFor="confirmation" srOnly>
                    Confirmation
                  </FormLabel>
                  <Input
                    id="confirmation"
                    {...register("confirmation", {
                      required: "Field is required",
                      validate: (value) =>
                        value === `delete team ${team}`
                          ? true
                          : "Confirmation does not match",
                    })}
                    type="text"
                  />
                  {errors.confirmation && (
                    <FormErrorMessage>
                      {errors.confirmation.message}
                    </FormErrorMessage>
                  )}
                </FormControl>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter gap={3}>
              <Button
                ref={cancelRef}
                onClick={onClose}
                isDisabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default DeleteConfirmation
