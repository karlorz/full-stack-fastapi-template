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
  Link,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { useRef } from "react"
import { useForm } from "react-hook-form"

import { TeamsService, UsersService } from "../../client"
import useAuth from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
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
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
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
      onClose()
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
            data-testid="delete-confirmation-user"
          >
            <AlertDialogHeader>Delete Account</AlertDialogHeader>

            {ownsTeams ? (
              <>
                <AlertDialogBody>
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle mr={2}>Warning:</AlertTitle>
                    You cannot delete your account.
                  </Alert>
                  <Text my={4}>
                    You must remove or transfer ownership of your teams before
                    deleting your account. Please visit the{" "}
                    <Link
                      as={RouterLink}
                      to="/teams/all"
                      color="ui.main"
                      fontWeight="bolder"
                    >
                      teams page
                    </Link>{" "}
                    to manage your teams.
                  </Text>
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button onClick={onClose}>Ok</Button>
                </AlertDialogFooter>
              </>
            ) : (
              <>
                <AlertDialogBody>
                  <VStack spacing={4}>
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <AlertTitle mr={2}>Warning:</AlertTitle>
                      This action cannot be undone.
                    </Alert>
                    {/* TODO: Update this text when the other features are completed*/}
                    <Text w="100%">
                      All your account data will be{" "}
                      <strong>permanently deleted.</strong>
                    </Text>
                    <Text>
                      Type <strong>delete my account</strong> below to confirm
                      and click the confirm button.
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
                            value === "delete my account"
                              ? true
                              : "Confirmation does not match",
                        })}
                      />
                      {errors.confirmation && (
                        <FormErrorMessage>
                          {errors.confirmation.message}
                        </FormErrorMessage>
                      )}{" "}
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
              </>
            )}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
}

export default DeleteConfirmation
