import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { type InvitationCreate, InvitationsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
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
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const invitationSchema = z.object({
  email: z.email(),
})

type FormData = z.infer<typeof invitationSchema>

interface NewInvitationProps {
  teamId: string
}

const NewInvitation = ({ teamId }: NewInvitationProps) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(invitationSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: InvitationCreate) =>
      InvitationsService.createInvitation({ requestBody: data }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
      showSuccessToast(
        `Invitation sent to ${data.email}. They just need to accept it to join your team.`,
      )
      handleClose()
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({ email: data.email, role: "member", team_id: teamId })
  }

  const handleClose = () => {
    setOpen(false)
    mutation.reset()
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4 md:ml-auto">Invite Member</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Team Invitation</DialogTitle>
              <DialogDescription>
                Fill in the email address to invite someone to your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="trinity@matrix.io"
                        data-testid="invitation-email"
                        className="w-full"
                        autoFocus
                        disabled={mutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <LoadingButton loading={mutation.isPending} type="submit">
                Send Invitation
              </LoadingButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default NewInvitation
