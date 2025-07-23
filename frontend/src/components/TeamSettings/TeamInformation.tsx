import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { TeamsService, type TeamUpdate } from "@/client"
import { Button } from "@/components/ui/button"
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { fetchTeamBySlug, getCurrentUserRole, handleError } from "@/utils"
import DangerZoneAlert from "../Common/DangerZone"
import Invitations from "../Invitations/Invitations"
import NewInvitation from "../Invitations/NewInvitation"
import PendingTeamInformation from "../PendingComponents/PendingTeamInformation"
import Team from "../Teams/Team"
import { CustomCard } from "../ui/custom-card"
import DeleteConfirmation from "./DeleteConfirmation"
import TransferTeam from "./TransferTeam"

const formSchema = z.object({
  name: z.string().nonempty("Name is required").min(3).max(50),
})

type FormData = z.infer<typeof formSchema>

const TeamInformation = ({ teamSlug }: { teamSlug: string }) => {
  const [isEditing, setIsEditing] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const currentUser = useCurrentUser()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team.name,
    },
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
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
    setIsEditing(false)
  }

  return (
    <Suspense fallback={<PendingTeamInformation />}>
      <div className="space-y-12">
        <CustomCard
          title="Team Information"
          description="Update your team’s information."
          data-testid="team-information-card"
        >
          {currentUserRole === "admin" ? (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-full max-w-lg space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                        Team Name
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            disabled={!isEditing}
                            data-testid="team-name-input"
                            className="w-full"
                          />
                          {!isEditing ? (
                            <Button
                              type="button"
                              onClick={() => setIsEditing(true)}
                            >
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button type="submit">Save</Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsEditing(false)
                                  form.reset({ name: team.name })
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          ) : (
            <Input value={team.name} disabled className="w-1/2" />
          )}
        </CustomCard>

        {!team.is_personal_team && (
          <>
            <CustomCard
              data-testid="team-members"
              header={
                <CardHeader className="p-0 relative">
                  <CardTitle className="flex items-center gap-2">
                    Team Members
                  </CardTitle>
                  <CardDescription>
                    Manage active members and pending invitations.
                  </CardDescription>
                  {currentUserRole === "admin" && (
                    <div className="sm:absolute sm:top-4 sm:right-4 mt-4 sm:mt-0">
                      <NewInvitation teamId={team.id} />
                    </div>
                  )}
                </CardHeader>
              }
            >
              <Tabs defaultValue="active">
                <TabsList>
                  <TabsTrigger value="active">Active Members</TabsTrigger>
                  {currentUserRole === "admin" && (
                    <TabsTrigger value="pending">
                      Pending Invitations
                    </TabsTrigger>
                  )}
                </TabsList>
                <TabsContent value="active">
                  <Team team={team} />
                </TabsContent>
                {currentUserRole === "admin" && (
                  <TabsContent value="pending">
                    <Invitations team={team} />
                  </TabsContent>
                )}
              </Tabs>
            </CustomCard>

            {isCurrentUserOwner && (
              <CustomCard
                header={
                  <CardHeader className="p-0">
                    <CardTitle className="flex items-center gap-2">
                      Transfer Team Ownership
                    </CardTitle>
                    <CardDescription>
                      You are the{" "}
                      <span className="font-bold">current team owner.</span> You
                      can transfer ownership to a team admin by selecting their
                      name from the list below.
                    </CardDescription>
                  </CardHeader>
                }
              >
                <TransferTeam adminUsers={adminUsers} team={teamSlug} />
              </CustomCard>
            )}

            {currentUserRole === "admin" && (
              <CustomCard>
                <DangerZoneAlert description="Permanently delete your data and everything associated with your team">
                  <DeleteConfirmation team={team} />
                </DangerZoneAlert>
              </CustomCard>
            )}
          </>
        )}
      </div>
    </Suspense>
  )
}

export default TeamInformation
