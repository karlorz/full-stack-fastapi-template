import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import confetti from "@/assets/confetti.json"
import warning from "@/assets/failed.json"
import { type ApiError, type TeamCreate, TeamsService } from "@/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { extractErrorMessage } from "@/utils"

export const Route = createFileRoute("/_layout/teams/new")({
  component: NewTeam,
})

function NewTeam() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<TeamCreate>({
    mode: "onSubmit",
    criteriaMode: "all",
    defaultValues: {
      name: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: TeamCreate) =>
      TeamsService.createTeam({ requestBody: data }),
    onSuccess: () => {
      form.reset()
      setIsOpen(true)
    },
    onError: () => {
      setIsOpen(true)
    },
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit: SubmitHandler<TeamCreate> = (data) => {
    mutation.mutate(data)
  }

  const handleClose = () => {
    setIsOpen(false)
    navigate({ to: "/" })
  }

  const handleInviteMembers = () => {
    setIsOpen(false)
    navigate({
      to: "/$teamSlug/settings",
      params: { teamSlug: mutation.data?.slug },
    })
  }

  return (
    <div className="container mx-auto p-0">
      <h1 className="text-2xl font-extrabold tracking-tight">New Team</h1>
      <p className="text-sm text-muted-foreground">
        Create a new team to manage your projects and collaborate with your team
        members.
      </p>

      <div className="pt-10">
        <Card data-testid="team-name">
          <CardHeader>
            <CardTitle>Team Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="w-1/2 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  rules={{
                    required: "Name is required",
                    minLength: {
                      value: 3,
                      message: "Name must be at least 3 characters",
                    },
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Team 1"
                            data-testid="team-name-input"
                            {...field}
                          />
                          <LoadingButton
                            type="submit"
                            loading={mutation.isPending}
                          >
                            Create Team
                          </LoadingButton>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          {mutation.isSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Team Created!</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <Lottie
                  animationData={confetti}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </div>
              <DialogDescription>
                Your team{" "}
                <span className="font-bold">{mutation.variables?.name}</span>{" "}
                has been created successfully. Now you can invite your team
                members and start collaborating together.
              </DialogDescription>
              <DialogFooter>
                <Button onClick={handleInviteMembers}>Invite Members</Button>
              </DialogFooter>
            </>
          ) : mutation.isError ? (
            <>
              <DialogHeader>
                <DialogTitle>Team Creation Failed</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <Lottie
                  animationData={warning}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </div>
              {mutation.error && (
                <p className="text-destructive font-bold text-center mt-4">
                  {extractErrorMessage(mutation.error as ApiError)}
                </p>
              )}
              <DialogDescription>
                Oops! An error occurred while creating the team. Please try
                again later. If the issue persists, contact our support team for
                assistance.
              </DialogDescription>
              <DialogFooter>
                <Button onClick={handleClose}>Ok</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
