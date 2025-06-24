import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { createFileRoute, useNavigate } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import confetti from "@/assets/confetti.json"
import warning from "@/assets/failed.json"
import { type ApiError, type AppCreate, AppsService } from "@/client"
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
import { getTeamQueryOptions } from "@/queries/teams"
import { extractErrorMessage } from "@/utils"

const formSchema = z.object({
  name: z.string().nonempty("Name is required").min(3).max(50),
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
  const [isOpen, setIsOpen] = useState(false)

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
    mutation.mutate({ ...data, team_id: team.id })
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div className="w-full p-0">
      <h1 className="text-2xl font-extrabold tracking-tight">New App</h1>
      <p className="text-muted-foreground">Create a new app in your team.</p>

      <div className="pt-10">
        <Card>
          <CardHeader>
            <CardTitle>App Name</CardTitle>
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
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            placeholder="App 1"
                            data-testid="app-name-input"
                            {...field}
                          />
                          <LoadingButton
                            type="submit"
                            loading={mutation.isPending}
                          >
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
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <DialogContent>
          {mutation.isSuccess ? (
            <>
              <DialogHeader data-testid="app-created-success">
                <DialogTitle>App Created!</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                <Lottie
                  animationData={confetti}
                  loop={false}
                  style={{ width: 75, height: 75 }}
                />
              </div>
              <DialogDescription>
                Your app{" "}
                <span className="font-bold">{mutation.variables?.name}</span>{" "}
                has been created successfully. Now you can start deploying your
                app.
              </DialogDescription>
              <DialogFooter>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsOpen(false)
                    navigate({
                      to: "/$teamSlug/apps/$appSlug",
                      params: {
                        teamSlug,
                        appSlug: mutation.data?.slug,
                      },
                    })
                  }}
                >
                  Go to App
                </Button>
              </DialogFooter>
            </>
          ) : mutation.isError ? (
            <>
              <DialogHeader>
                <DialogTitle>App Creation Failed</DialogTitle>
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
                Oops! An error occurred while creating the app. Please try again
                later. If the issue persists, contact our support team for
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
