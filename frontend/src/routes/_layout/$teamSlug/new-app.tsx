import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { type AppCreate, AppsService } from "@/client"
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
import { getTeamQueryOptions } from "@/queries/teams"
import { handleError } from "@/utils"

const formSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
})

type FormData = z.infer<typeof formSchema>

export const Route = createFileRoute("/_layout/$teamSlug/new-app")({
  component: NewApp,
  loader: ({ context, params: { teamSlug } }) =>
    context.queryClient.ensureQueryData(getTeamQueryOptions(teamSlug)),
})

function NewApp() {
  const { teamSlug } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  })

  const { data: team } = useSuspenseQuery(getTeamQueryOptions(teamSlug))

  const mutation = useMutation({
    mutationFn: (data: AppCreate) =>
      AppsService.createApp({ requestBody: data }),
    onSuccess: (data) => {
      form.reset()
      showSuccessToast(
        `App "${data.name}" created successfully! You can now start deploying your application.`,
      )
      setTimeout(() => {
        navigate({
          to: "/$teamSlug/apps/$appSlug",
          params: {
            teamSlug,
            appSlug: data.slug,
          },
        })
      }, 500)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({ ...data, team_id: team.id })
  }

  return (
    <Section title="New App" description="Create a new app in your team.">
      <CustomCard title="App Information">
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
                        placeholder="My Awesome App"
                        data-testid="app-name-input"
                        {...field}
                        className="w-full"
                        autoFocus
                        disabled={mutation.isPending}
                      />
                      <LoadingButton type="submit" loading={mutation.isPending}>
                        Create App
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
