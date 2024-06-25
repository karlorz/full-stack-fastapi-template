import {
  Button,
  Flex,
  FormErrorMessage,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { AiFillEdit, AiFillSave } from "react-icons/ai"

import { type ApiError, type TeamUpdate, TeamsService } from "../../client"
import { useCurrentUser } from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import { Route } from "../../routes/_layout/$team"
import { getCurrentUserRole } from "../../utils"

const TeamName = () => {
  const currentUser = useCurrentUser()
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const { team: teamSlug } = Route.useParams()
  const [editMode, setEditMode] = useState(false)
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => TeamsService.readTeam({ teamSlug: teamSlug }),
  })
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty },
  } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      name: team.name,
    },
  })
  const currentUserRole = getCurrentUserRole(team, currentUser)

  const toggleEditMode = () => {
    setEditMode(!editMode)
  }

  const onCancel = () => {
    reset()
    toggleEditMode()
  }

  const mutation = useMutation({
    mutationFn: (data: TeamUpdate) =>
      TeamsService.updateTeam({ requestBody: data, teamSlug: teamSlug }),
    onSuccess: () => {
      showToast("Success!", "Team information updated successfully", "success")
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<TeamUpdate> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <Flex
      maxW="full"
      align="center"
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      {editMode ? (
        <Input
          id="name"
          {...register("name", {})}
          type="text"
          size="md"
          w="250px"
        />
      ) : (
        <Text w="250px">{team.name}</Text>
      )}
      {errors.name && (
        <FormErrorMessage>{errors.name.message}</FormErrorMessage>
      )}
      {currentUserRole === "admin" && (
        <Flex gap={2} ml={4}>
          {editMode && (
            <Button onClick={onCancel} isDisabled={isSubmitting} size="sm">
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            leftIcon={<Icon as={editMode ? AiFillSave : AiFillEdit} />}
            size="sm"
            onClick={toggleEditMode}
            type={editMode ? "button" : "submit"}
            isLoading={editMode ? isSubmitting : false}
            isDisabled={editMode ? !isDirty : false}
          >
            {editMode ? "Save" : "Edit"}
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default TeamName
