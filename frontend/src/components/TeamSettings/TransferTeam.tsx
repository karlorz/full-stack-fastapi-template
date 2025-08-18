import { zodResolver } from "@hookform/resolvers/zod"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { TeamsService } from "@/client"
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
  FormLabel,
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
import useCustomToast from "@/hooks/useCustomToast"
import { fetchTeamBySlug, handleError } from "@/utils"
import { DestructiveAlert } from "../Common/DestructiveAlert"

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

  if (adminUsers.length === 0) {
    return (
      <div>
        <p className="font-normal">
          No admin users available to transfer ownership to.
        </p>
        <p className="text-muted-foreground mt-1">
          Promote at least one team member to admin in the Team Members section
          above.
        </p>
      </div>
    )
  }

  return (
    <Form {...form}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium mb-2 block">
                  Select Admin User
                </FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger
                      data-testid="user-select"
                      className="w-full h-10"
                    >
                      <SelectValue placeholder="Choose an admin to transfer to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {adminUsers.map((admin) => (
                        <SelectItem
                          key={admin.user.id}
                          value={admin.user.id}
                          className="py-2"
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {admin.user.email.charAt(0).toUpperCase()}
                            </div>
                            <span>{admin.user.email}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex-shrink-0">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                disabled={!form.watch("userId")}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                Transfer Team
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                data-testid="transfer-confirmation-team"
              >
                <DialogHeader className="space-y-2">
                  <DialogTitle>Transfer Team Ownership</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <DestructiveAlert />
                  <DialogDescription>
                    You will{" "}
                    <span className="font-bold">
                      permanently transfer ownership
                    </span>{" "}
                    of this team. Type{" "}
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
                    variant="destructive"
                    loading={mutation.isPending}
                    disabled={confirmationValue !== `transfer team ${teamSlug}`}
                  >
                    Transfer Team
                  </LoadingButton>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Form>
  )
}

export default TransferTeam
