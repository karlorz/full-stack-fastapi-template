import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useFeatureFlagEnabled } from "posthog-js/react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { type TeamCreate, TeamsService } from "@/client"
import { CustomCard } from "@/components/ui/custom-card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { Section } from "@/components/ui/section"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/_layout/teams/new")({
  component: NewTeam,
  head: () => ({
    meta: [
      {
        title: "New Team - FastAPI Cloud",
      },
    ],
  }),
})

function NewTeam() {
  const navigate = useNavigate()
  const teamCreation = useFeatureFlagEnabled("team-creation-enabled")
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: TeamCreate) =>
      TeamsService.createTeam({ requestBody: data }),
    onSuccess: (data) => {
      form.reset()
      showSuccessToast(
        `Team "${data.name}" created successfully! Now you can invite your team members and start collaborating together.`,
      )
      setTimeout(() => {
        navigate({
          to: "/$teamSlug/settings",
          params: { teamSlug: data.slug },
        })
      }, 500)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate(data)
  }

  return (
    <Section
      title="New Team"
      description="Create a new team to manage your projects and collaborate with your team members."
    >
      <CustomCard data-testid="team-name" title="Team Information">
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
                    Name
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        placeholder="My Awesome Team"
                        data-testid="team-name-input"
                        {...field}
                        autoFocus
                        disabled={mutation.isPending}
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
    </Section>
  )
}
