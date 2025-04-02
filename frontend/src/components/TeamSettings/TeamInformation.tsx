import { Container, Flex, Input, Tabs, Text } from "@chakra-ui/react"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"

import { type TeamUpdate, TeamsService } from "@/client"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { Route } from "@/routes/_layout/$team"
import {
  fetchTeamBySlug,
  getCurrentUserRole,
  handleError,
  nameRules,
} from "@/utils"
import { Suspense } from "react"
import CustomCard from "../Common/CustomCard"
import EditableField from "../Common/EditableField"
import Invitations from "../Invitations/Invitations"
import NewInvitation from "../Invitations/NewInvitation"
import PendingTeamInformation from "../PendingComponents/PendingTeamInformation"
import Team from "../Teams/Team"
import { Field } from "../ui/field"
import DeleteTeam from "./DeleteTeam"
import TransferTeam from "./TransferTeam"

const TeamInformationContent = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })
  const currentUserRole = getCurrentUserRole(team, currentUser)
  const isCurrentUserOwner = team.owner_id === currentUser?.id
  const adminUsers = team.user_links.filter(
    (userLink) =>
      userLink.role === "admin" && userLink.user.id !== currentUser?.id,
  )

  const mutation = useMutation({
    mutationFn: (data: TeamUpdate) =>
      TeamsService.updateTeam({ requestBody: data, teamId: team.id }),
    onSuccess: () => {
      showSuccessToast("Team updated successfully")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  return (
    <Container maxW="full" my={4} px={0} pt={10}>
      <CustomCard title="Team Name" data-testid="team-name-card">
        {currentUserRole === "admin" ? (
          <EditableField
            type="name"
            value={team.name}
            onSubmit={(newName) => mutation.mutate({ name: newName })}
            rules={nameRules()}
          />
        ) : (
          <Field w="50%">
            <Input value={team.name} disabled />
          </Field>
        )}
      </CustomCard>
      {!team.is_personal_team && (
        <>
          <CustomCard title="Team Members" data-testid="team-members">
            {currentUserRole === "admin" && <NewInvitation teamId={team.id} />}
            <Tabs.Root
              variant="subtle"
              p={0}
              height="30rem"
              defaultValue="active"
            >
              <Tabs.List>
                <Tabs.Trigger value="active">Active Members</Tabs.Trigger>
                {currentUserRole === "admin" && (
                  <Tabs.Trigger value="pending">
                    Pending Invitations
                  </Tabs.Trigger>
                )}
              </Tabs.List>
              <Tabs.Content value="active" px={0}>
                <Team />
              </Tabs.Content>
              {currentUserRole === "admin" && (
                <Tabs.Content value="pending" px={0}>
                  <Invitations teamId={team.id} />
                </Tabs.Content>
              )}
            </Tabs.Root>
          </CustomCard>
          {isCurrentUserOwner && (
            <Flex
              direction={{ base: "column", md: "row" }}
              gap={4}
              justifyContent="space-between"
            >
              <CustomCard title="Transfer Ownership" width="100%">
                <Text mb={4}>
                  You are the <b>current team owner.</b> You can transfer
                  ownership to a team admin by selecting their name from the
                  list below.
                </Text>
                <TransferTeam adminUsers={adminUsers} />
              </CustomCard>
            </Flex>
          )}
          {currentUserRole === "admin" && (
            <CustomCard>
              <DeleteTeam teamId={team.id} />
            </CustomCard>
          )}
        </>
      )}
    </Container>
  )
}

const TeamInformation = () => {
  return (
    <Suspense fallback={<PendingTeamInformation />}>
      <TeamInformationContent />
    </Suspense>
  )
}

export default TeamInformation
