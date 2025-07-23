import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import confetti from "@/assets/confetti.json"
import warning from "@/assets/failed.json"
import { type ApiError, type TeamCreate, TeamsService } from "@/client"
import { Button } from "@/components/ui/button"
import { CustomCard } from "@/components/ui/custom-card"
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
import { Section } from "@/components/ui/section"
import { extractErrorMessage } from "@/utils"

const formSchema = z.object({
  name: z.string().nonempty("Name is required").min(3).max(50),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/_layout/teams/new")({
  component: NewTeam,
})

function NewTeam() {
  const navigate = useNavigate()
  const teamCreation = useFeatureFlagEnabled("team-creation-enabled")
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = (data: FormData) => {
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
    <Section
      title="New Team"
      description="Create a new team to manage your projects and collaborate with your team members."
    >
      <CustomCard data-testid="team-name" title="Team Name">
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
                        disabled={!teamCreation}
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
      </CustomCard>

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
    </Section>
  )
}
