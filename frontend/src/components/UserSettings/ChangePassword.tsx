import { Box, Button, Container, Text } from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"

import { type UpdatePassword, UsersService } from "../../client"
import useCustomToast from "../../hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "../../utils"
import PasswordField from "../Common/PasswordField"

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string
}

const ChangePassword = () => {
  const showToast = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showToast("Success!", "Password updated successfully", "success")
      reset()
    },
    onError: handleError.bind(showToast),
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
        <Box as="form" onSubmit={handleSubmit(onSubmit)} mt={4} maxW="350px">
          <PasswordField
            password="current_password"
            errors={errors}
            register={register}
            placeholder="Current password"
          />
          <PasswordField
            password="new_password"
            errors={errors}
            register={register}
            options={passwordRules()}
            placeholder="New Password"
          />
          <PasswordField
            password="confirm_password"
            errors={errors}
            register={register}
            options={confirmPasswordRules(getValues)}
            placeholder="Confirm Password"
          />
          <Button
            variant="primary"
            mt={4}
            type="submit"
            isLoading={isSubmitting}
          >
            Save
          </Button>
        </Box>
      </Container>
    </>
  )
}
export default ChangePassword
