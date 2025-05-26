import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AlertTriangle } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { AppsService } from "@/client"
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { LoadingButton } from "../ui/loading-button"

interface DeleteProps {
  appId: string
  appSlug: string
}

const formSchema = (appSlug: string) =>
  z.object({
    confirmation: z
      .string()
      .min(1, "Field is required")
      .refine((value) => value === `delete app ${appSlug}`, {
        message: "Confirmation does not match",
      }),
  })

type FormData = z.infer<ReturnType<typeof formSchema>>

const DeleteConfirmation = ({ appId, appSlug }: DeleteProps) => {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema(appSlug)),
    mode: "onBlur",
    defaultValues: {
      confirmation: "",
    },
  })

  const mutation = useMutation({
    mutationFn: () => AppsService.deleteApp({ appId }),
    onSuccess: () => {
      showSuccessToast("The app was deleted successfully")
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
          Delete App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            data-testid="delete-confirmation-app"
          >
            <DialogHeader className="space-y-2">
              <DialogTitle>Delete App</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning: This action cannot be undone.</AlertTitle>
              </Alert>
              <DialogDescription>
                {/* TODO: Update this text when the other features are completed*/}
                Type <span className="font-bold">delete app {appSlug}</span>{" "}
                below to confirm and click the confirm button.
              </DialogDescription>
              <FormField
                control={form.control}
                name="confirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder={`Type "delete app ${appSlug}" to confirm`}
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
                disabled={confirmationValue !== `delete app ${appSlug}`}
              >
                Confirm
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DeleteConfirmation
