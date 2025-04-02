import { TeamsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { fetchTeamBySlug, handleError } from "@/utils"
import { Container, Flex } from "@chakra-ui/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { Select } from "chakra-react-select"
import { Controller, useForm } from "react-hook-form"

import { Button } from "../ui/button"
import { Field } from "../ui/field"

interface TransferTeamForm {
  userId: string
}

interface AdminUser {
  user: {
    email: string
    id: string
  }
}

interface TransferTeamProps {
  adminUsers: AdminUser[]
  team: string
}

const TransferTeam = ({ adminUsers, team: teamSlug }: TransferTeamProps) => {
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })
  const queryClient = useQueryClient()
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TransferTeamForm>({
    mode: "onBlur",
    defaultValues: {
      userId: "",
    },
  })

  const { showSuccessToast, showErrorToast } = useCustomToast()

  const selectOptions = adminUsers.map((admin) => ({
    value: admin.user.id,
    label: admin.user.email,
  }))

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      return TeamsService.transferTeam({
        teamId: team.id,
        requestBody: {
          user_id: userId,
        },
      })
    },
    onSuccess: () => {
      showSuccessToast("The team was transferred successfully")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = ({ userId }: TransferTeamForm) => mutation.mutate(userId)

  return (
    <Container maxW="full" p={0}>
      <Flex
        as="form"
        align="center"
        flexDir={{ base: "column", md: "row" }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Field
          invalid={!!errors.userId}
          errorText={errors.userId?.message}
          w={{ base: "100%", md: "xs" }}
          data-testid="user-select"
        >
          <Controller
            control={control}
            name="userId"
            rules={{ required: "Please select a user" }}
            render={({ field }) => (
              <Select
                options={selectOptions}
                value={selectOptions.find(
                  (option) => option.value === field.value,
                )}
                onChange={(selectedOption) =>
                  field.onChange(selectedOption?.value)
                }
                placeholder={<>Select User</>}
                data-testid="user-select"
              />
            )}
          />
        </Field>

        <Button
          variant="solid"
          type="submit"
          ml={{ base: 0, md: 4 }}
          display={{ base: "block", md: "inline-block" }}
          mt={{ base: 4, md: 0 }}
          alignSelf={{ base: "flex-start", md: "auto" }}
          loading={mutation.isPending}
        >
          Transfer Team
        </Button>
      </Flex>
    </Container>
  )
}

export default TransferTeam
