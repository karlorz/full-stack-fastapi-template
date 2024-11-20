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
import Team from "../Teams/Team"
import { Button } from "../ui/button"
import { DialogRoot, DialogTrigger } from "../ui/dialog"
import { Field } from "../ui/field"
import { Skeleton } from "../ui/skeleton"
import DeleteTeam from "./DeleteTeam"
import TransferTeam from "./TransferTeam"

const TeamInformationContent = () => {
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const { team: teamSlug } = Route.useParams()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })
  const owner = team.user_links.find(({ user }) => user.id === team.owner_id)
  const currentUserRole = getCurrentUserRole(team, currentUser)
  const isCurrentUserOwner = owner?.user.id === currentUser?.id

  const mutation = useMutation({
    mutationFn: (data: TeamUpdate) =>
      TeamsService.updateTeam({ requestBody: data, teamId: team.id }),
    onSuccess: () => {
      showToast("Success!", "Team updated successfully", "success")
    },
    onError: handleError.bind(showToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  return (
    <Container maxW="full" my={4} px={0} pt={10}>
      <CustomCard title="Team Name">
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
            {currentUserRole === "admin" && (
              <DialogRoot size={{ base: "xs", md: "md" }} placement="center">
                <DialogTrigger asChild>
                  <Button variant="solid" marginLeft="auto">
                    Invite Member
                  </Button>
                </DialogTrigger>
                <NewInvitation teamId={team.id} />
              </DialogRoot>
            )}
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
                  You are the current team owner. You can transfer ownership to
                  another team member.
                </Text>
                <TransferTeam />
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
    <Suspense
      fallback={
        <Flex
          direction="column"
          justify="center"
          align="center"
          height="80vh"
          gap={4}
          pt={12}
        >
          <Skeleton height="25%" width="100%" />
          <Skeleton height="25%" width="100%" />
          <Skeleton height="25%" width="100%" />
          <Skeleton height="25%" width="100%" />
        </Flex>
      }
    >
      <TeamInformationContent />
    </Suspense>
  )
}

export default TeamInformation
