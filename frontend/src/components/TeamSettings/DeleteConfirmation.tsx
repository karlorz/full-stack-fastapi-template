import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type TeamPublic, TeamsService } from "@/client"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { DestructiveAlert } from "../Common/DestructiveAlert"

const formSchema = (teamSlug: string) =>
  z.object({
    confirmation: z
      .string()
      .min(1, "Field is required")
      .refine((value) => value === `delete team ${teamSlug}`, {
        message: "Confirmation does not match",
      }),
  })

type FormData = z.infer<ReturnType<typeof formSchema>>

const DeleteConfirmation = ({ team }: { team: TeamPublic }) => {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema(team.slug)),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      confirmation: "",
    },
  })

  const mutation = useMutation({
    mutationFn: () => TeamsService.deleteTeam({ teamId: team.id }),
    onSuccess: () => {
      showSuccessToast("The team was deleted successfully")
      localStorage.removeItem("current_team")
      navigate({ to: "/" })
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
          Delete Team
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-testid="delete-confirmation-team"
          >
            <DialogHeader className="space-y-2">
              <DialogTitle>Delete Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <DestructiveAlert />
              <DialogDescription>
                {/* TODO: Update this text when the other features are completed*/}
                This team will be{" "}
                <span className="font-bold">permanently deleted.</span> Type{" "}
                <span className="font-bold">delete team {team.slug}</span> below
                to confirm and click the confirm button.
              </DialogDescription>
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={`Type "delete team ${team.slug}" to confirm`}
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
                disabled={confirmationValue !== `delete team ${team.slug}`}
              >
                Delete Team
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmation
