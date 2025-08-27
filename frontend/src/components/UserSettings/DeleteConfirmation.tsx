import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { TeamsService, UsersService } from "@/client"
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
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { DestructiveAlert } from "../Common/DestructiveAlert"
import { LoadingButton } from "../ui/loading-button"

const formSchema = z.object({
  confirmation: z
    .string()
    .min(1, { error: "Field is required" })
    .refine((value) => value === "delete my account", {
      error: "Confirmation does not match",
    }),
})

type FormData = z.infer<typeof formSchema>

const DeleteConfirmation = () => {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()
  const { logout } = useAuth()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })

  const { data: userTeams } = useQuery({
    queryKey: ["teams"],
    queryFn: () =>
      TeamsService.readTeams({
        owner: true,
      }),
  })

  const nonPersonalUserTeams = userTeams?.data?.filter(
    (team) => team.is_personal_team === false,
  )
  const ownsTeams = (nonPersonalUserTeams?.length ?? 0) > 0

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast("Your account was deleted successfully")
      logout()
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmit = () => {
    mutation.mutate()
  }

  const confirmationValue = form.watch("confirmation")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="md:inline-block block md:mt-0 mt-4 self-start md:self-auto"
        >
          Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {ownsTeams ? (
          <>
            <DialogHeader className="space-y-2">
              <DialogTitle>Delete Account</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <DestructiveAlert />
              <DialogDescription>
                You must remove or transfer ownership of your teams before
                deleting your account. Please visit the{" "}
                <RouterLink
                  className="text-primary hover:underline"
                  to="/teams/all"
                >
                  teams page
                </RouterLink>{" "}
                to manage your teams.
              </DialogDescription>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.reset()}
                >
                  Ok
                </Button>
              </DialogClose>
            </DialogFooter>
          </>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              data-testid="delete-confirmation-user"
            >
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <DestructiveAlert />
                <DialogDescription>
                  {/* TODO: Update this text when the other features are completed*/}
                  All your account data will be{" "}
                  <span className="font-bold">permanently deleted.</span> Type{" "}
                  <span className="font-bold">delete my account</span> below to
                  confirm and click the confirm button.
                </DialogDescription>
                <FormField
                  control={form.control}
                  name="confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder='Type "delete my account" to confirm'
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
                  disabled={confirmationValue !== "delete my account"}
                >
                  Delete Account
                </LoadingButton>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmation
