import {
  Button,
  Container,
  Flex,
  Skeleton,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
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
import DeleteTeam from "./DeleteTeam"
import TransferTeam from "./TransferTeam"

const TeamInformationContent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
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
        <EditableField
          type="name"
          value={team.name}
          onSubmit={(newName) => mutation.mutate({ name: newName })}
          canEdit={currentUserRole === "admin"}
          rules={nameRules()}
        />
      </CustomCard>
      {!team.is_personal_team && (
        <>
          <CustomCard title="Team Members" data-testid="team-members">
            <Flex justifyContent="flex-end">
              <Button variant="primary" onClick={onOpen}>
                New Invitation
              </Button>
            </Flex>
            <NewInvitation isOpen={isOpen} onClose={onClose} teamId={team.id} />
            <Tabs variant="enclosed" p={0} height="30rem">
              <TabList>
                <Tab>Active Members</Tab>
                {currentUserRole === "admin" && <Tab>Pending Invitations</Tab>}
              </TabList>
              <TabPanels>
                <TabPanel px={0}>
                  <Team />
                </TabPanel>
                {currentUserRole === "admin" && (
                  <TabPanel px={0}>
                    <Invitations teamId={team.id} />
                  </TabPanel>
                )}
              </TabPanels>
            </Tabs>
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
