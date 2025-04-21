import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { type TeamUpdate, TeamsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { fetchTeamBySlug, getCurrentUserRole, handleError } from "@/utils"
import Invitations from "../Invitations/Invitations"
import NewInvitation from "../Invitations/NewInvitation"
import PendingTeamInformation from "../PendingComponents/PendingTeamInformation"
import Team from "../Teams/Team"
import DeleteTeam from "./DeleteTeam"
import TransferTeam from "./TransferTeam"

const formSchema = z.object({
  name: z.string().nonempty("Name is required").max(50),
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

  const onSubmit = (values: FormData) => {
    mutation.mutate({ name: values.name })
    setIsEditing(false)
  }

  return (
    <Suspense fallback={<PendingTeamInformation />}>
      <div className="pt-10">
        <Card data-testid="team-name">
          <CardHeader>
            <CardTitle>Team Name</CardTitle>
          </CardHeader>
          <CardContent>
            {currentUserRole === "admin" ? (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="w-1/2 space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              {...field}
                              disabled={!isEditing}
                              data-testid="team-name-input"
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
          </CardContent>
        </Card>

        {!team.is_personal_team && (
          <>
            <Card className="mt-4" data-testid="team-members">
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle>Team Members</CardTitle>
                  {currentUserRole === "admin" && (
                    <NewInvitation teamId={team.id} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {isCurrentUserOwner && (
              <Card className="mt-4 gap-0">
                <CardHeader>
                  <CardTitle>Transfer Ownership</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    You are the{" "}
                    <span className="font-bold">current team owner.</span> You
                    can transfer ownership to a team admin by selecting their
                    name from the list below.
                  </CardDescription>
                  <TransferTeam adminUsers={adminUsers} team={teamSlug} />
                </CardContent>
              </Card>
            )}

            {currentUserRole === "admin" && (
              <Card className="mt-4">
                <CardContent>
                  <DeleteTeam team={team} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </Suspense>
  )
}

export default TeamInformation
