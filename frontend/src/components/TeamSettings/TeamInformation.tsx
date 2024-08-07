import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { type ApiError, type TeamUpdate, TeamsService } from "../../client"
import { useCurrentUser } from "../../hooks/useAuth"
import useCustomToast from "../../hooks/useCustomToast"
import { Route } from "../../routes/_layout/$team"
import { getCurrentUserRole } from "../../utils"
import EditableField from "../Common/EditableField"
import Invitations from "../Invitations/Invitations"
import NewInvitation from "../Invitations/NewInvitation"
import Team from "../Teams/Team"
import DeleteTeam from "./DeleteTeam"
import TransferTeam from "./TransferTeam"

const TeamInformation = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => TeamsService.readTeam({ teamSlug: teamSlug }),
  })
  const currentUserRole = getCurrentUserRole(team, currentUser)

  const mutation = useMutation({
    mutationFn: (data: TeamUpdate) =>
      TeamsService.updateTeam({ requestBody: data, teamSlug: teamSlug }),
    onSuccess: () => {
      showToast("Success!", "Team updated successfully", "success")
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  return (
    <Container maxW="full" m={4}>
      <Heading size="sm">Team Information</Heading>
      <Text py={2} mb={4}>
        See information regarding your team.
      </Text>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
        <Box my={4}>
          <Text fontWeight="bold" mb={4}>
            Team Name
          </Text>

          <Flex>
            <EditableField
              type="name"
              value={team.name}
              onSubmit={(newName) => mutation.mutate({ name: newName })}
              canEdit={currentUserRole === "admin"}
            />
          </Flex>
        </Box>
      </Box>
      <Box>
        <Box
          boxShadow="xs"
          px={8}
          py={4}
          borderRadius="lg"
          mb={8}
          data-testid="team-members"
        >
          <Text fontWeight="bold" mb={4}>
            Team Members
          </Text>
          <Team />
        </Box>
      </Box>
      {currentUserRole === "admin" && (
        <>
          <Flex gap="8">
            <Box width="70%">
              <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
                <Text fontWeight="bold" mb={4}>
                  Team Invitations
                </Text>
                <Flex>
                  <Invitations />
                </Flex>
              </Box>
            </Box>

            <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
              <Text fontWeight="bold" mb={4}>
                New Invitation
              </Text>
              <Flex>
                <NewInvitation />
              </Flex>
            </Box>
          </Flex>

          <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
            <Text fontWeight="bold" mb={4}>
              Transfer Ownership
            </Text>
            <Flex>
              <TransferTeam />
            </Flex>
          </Box>

          <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
            <Text fontWeight="bold" mb={4}>
              Danger Zone
            </Text>
            <Flex>
              <DeleteTeam />
            </Flex>
          </Box>
        </>
      )}
    </Container>
  )
}

export default TeamInformation
