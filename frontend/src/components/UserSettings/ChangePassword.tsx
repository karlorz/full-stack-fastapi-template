import { Box, Container, Text, VStack } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { Lock } from "lucide-react"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type UpdatePassword, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"
import { Button } from "../ui/button"
import { PasswordInput } from "../ui/password-input"

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string
}

const ChangePassword = () => {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<UpdatePasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Password updated successfully")
      reset()
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Container maxW="full" p={0}>
        <Text py={2} mb={4}>
          Change your password.
        </Text>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack gap={4} w={{ base: "100%", md: "md" }}>
            <PasswordInput
              type="current_password"
              startElement={<Lock size={16} />}
              {...register("current_password", passwordRules())}
              placeholder="Current Password"
              errors={errors}
            />
            <PasswordInput
              type="new_password"
              startElement={<Lock size={16} />}
              {...register("new_password", passwordRules())}
              placeholder="New Password"
              errors={errors}
            />
            <PasswordInput
              type="confirm_password"
              startElement={<Lock size={16} />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="Confirm Password"
              errors={errors}
            />
          </VStack>
          <Button
            variant="solid"
            mt={4}
            type="submit"
            loading={mutation.isPending}
          >
            Save
          </Button>
        </Box>
      </Container>
    </>
  )
}
export default ChangePassword
