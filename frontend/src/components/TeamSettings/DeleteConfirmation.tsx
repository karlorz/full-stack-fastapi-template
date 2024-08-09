import { WarningTwoIcon } from "@chakra-ui/icons"
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
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

import { TeamsService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { Route } from "../../routes/_layout/$team"
import { handleError } from "../../utils"

interface DeleteProps {
  isOpen: boolean
  onClose: () => void
}

interface DeleteInput {
  confirmation: string
}

const DeleteConfirmation = ({ isOpen, onClose }: DeleteProps) => {
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
      await TeamsService.deleteTeam({ teamSlug: team })
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
                <Box
                  bg="orange.100"
                  color="ui.danger"
                  w="100%"
                  p={4}
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <WarningTwoIcon w={4} h={4} color="ui.danger" />
                  <Text>
                    <strong>Warning:</strong> This action cannot be undone.
                  </Text>
                </Box>
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
              <Button variant="danger" type="submit">
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
