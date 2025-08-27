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
  name: z
    .string()
    .min(3, { error: "Name must be at least 3 characters" })
    .max(50, { error: "Name must be less than 50 characters" }),
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
                        <div className="flex gap-3">
                          <Input
                            {...field}
                            disabled={!isEditing}
                            data-testid="team-name-input"
                            className="w-full"
                          />
                          {!isEditing ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditing(true)}
                            >
                              Edit
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button type="submit" size="sm">
                                Save
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
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
            <div className="max-w-md">
              <Input value={team.name} disabled className="bg-muted/50" />
            </div>
          )}
        </CustomCard>

        {!team.is_personal_team && (
          <>
            <CustomCard
              data-testid="team-members"
              header={
                <CardHeader className="p-0 relative">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Team Members
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {currentUserRole === "admin"
                          ? "Manage active members and pending invitations."
                          : `${team.user_links.length} active member${team.user_links.length !== 1 ? "s" : ""}`}
                      </CardDescription>
                    </div>
                    {currentUserRole === "admin" && (
                      <div className="flex-shrink-0">
                        <NewInvitation teamId={team.id} />
                      </div>
                    )}
                  </div>
                </CardHeader>
              }
            >
              {currentUserRole === "admin" ? (
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="active" className="text-sm">
                      Active ({team.user_links.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-sm">
                      Pending
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="active" className="mt-6">
                    <Team team={team} currentUserRole={currentUserRole} />
                  </TabsContent>
                  <TabsContent value="pending" className="mt-6">
                    <Invitations team={team} />
                  </TabsContent>
                </Tabs>
              ) : (
                <Team team={team} currentUserRole={currentUserRole} />
              )}
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
                      <span className="font-bold">current team owner.</span>
                      {adminUsers.length > 0 ? (
                        <>
                          {" "}
                          You can transfer ownership to a team admin by
                          selecting their name from the list below.
                        </>
                      ) : (
                        <>
                          {" "}
                          Transfer ownership requires at least one other admin
                          on your team.
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                }
              >
                <TransferTeam adminUsers={adminUsers} team={teamSlug} />
              </CustomCard>
            )}

            {currentUserRole === "admin" && (
              <CustomCard>
                <DangerZoneAlert description="Permanently delete your data and everything associated with your team.">
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
