import { TeamsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { fetchTeamBySlug, handleError } from "@/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { AlertTriangle } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AdminUser {
  user: {
    email: string
    id: string
  }
}

interface TransferTeamProps {
  adminUsers: AdminUser[]
  team: string
}

const formSchema = (teamSlug: string) =>
  z.object({
    userId: z.string().min(1, "Please select a user"),
    confirmation: z
      .string()
      .min(1, "Field is required")
      .refine((value) => value === `transfer team ${teamSlug}`, {
        message: "Confirmation does not match",
      }),
  })

type FormData = z.infer<ReturnType<typeof formSchema>>

const TransferTeam = ({ adminUsers, team: teamSlug }: TransferTeamProps) => {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema(team.slug)),
    mode: "onBlur",
    defaultValues: {
      confirmation: "",
      userId: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (userId: string) =>
      TeamsService.transferTeam({
        teamId: team.id,
        requestBody: {
          user_id: userId,
        },
      }),
    onSuccess: () => {
      showSuccessToast("The team was transferred successfully")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = (values: FormData) => mutation.mutate(values.userId)

  const confirmationValue = form.watch("confirmation")

  return (
    <Form {...form}>
      <div className="pt-4 lg:w-1/2 space-y-4">
        <FormField
          control={form.control}
          name="userId"
          render={({ field }) => (
            <FormItem className="my-4">
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger data-testid="user-select" className="w-full">
                    <SelectValue placeholder="Select User" />
                  </SelectTrigger>
                  <SelectContent>
                    {adminUsers.length > 0 ? (
                      adminUsers.map((admin) => (
                        <SelectItem key={admin.user.id} value={admin.user.id}>
                          {admin.user.email}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-option" disabled>
                        No options available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button disabled={!form.watch("userId")}>Transfer Team</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-testid="transfer-confirmation-team"
          >
            <DialogHeader className="space-y-2">
              <DialogTitle>Transfer Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Team ownership will be transferred.</AlertTitle>
              </Alert>
              <DialogDescription>
                This team will be{" "}
                <span className="font-bold">transferred.</span> Type{" "}
                <span className="font-bold">transfer team {team.slug}</span>{" "}
                below to confirm and click the confirm button.
              </DialogDescription>
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={`Type "transfer team ${team.slug}" to confirm`}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="gap-3">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={mutation.isPending}
                  onClick={() => form.reset()}
                >
                  Cancel
                </Button>
              </DialogClose>
              <LoadingButton
                type="submit"
                loading={mutation.isPending}
                disabled={confirmationValue !== `transfer team ${teamSlug}`}
              >
                Confirm
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  )
}

export default TransferTeam
