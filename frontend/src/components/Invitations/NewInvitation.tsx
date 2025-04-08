import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Lottie from "lottie-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import emailSent from "@/assets/email.json"
import warning from "@/assets/failed.json"
import {
  type ApiError,
  type InvitationCreate,
  InvitationsService,
} from "@/client"
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
import { extractErrorMessage } from "@/utils"

const invitationSchema = z.object({
  email: z
    .string()
    .nonempty("Email is required")
    .email("Invalid email address"),
})

type FormData = z.infer<typeof invitationSchema>

interface NewInvitationProps {
  teamId: string
}

const NewInvitation = ({ teamId }: NewInvitationProps) => {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] })
    },
  })

  const onSubmit = (data: FormData) => {
    const updatedData: InvitationCreate = {
      email: data.email,
      role: "member",
      team_id: teamId,
    }
    mutation.mutate(updatedData)
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
            {mutation.isPending || mutation.isIdle ? (
              <>
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
                            placeholder="Email address"
                            data-testid="invitation-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Loading..." : "Send Invitation"}
                  </Button>
                </DialogFooter>
              </>
            ) : mutation.isSuccess ? (
              <>
                <DialogHeader>
                  <DialogTitle>Invitation Sent!</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <Lottie
                    animationData={emailSent}
                    loop={false}
                    style={{ width: 75, height: 75 }}
                  />
                </div>
                <DialogDescription className="space-y-2">
                  <p>
                    The invitation has been sent to{" "}
                    <span className="font-bold">{mutation.data?.email}.</span>
                    They just need to accept it to join your team.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    You can manage invitations from your team dashboard or send
                    another one.
                  </p>
                </DialogDescription>
                <DialogFooter>
                  <Button onClick={handleClose}>Ok</Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Invitation Failed</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center">
                  <Lottie
                    animationData={warning}
                    loop={false}
                    style={{ width: 75, height: 75 }}
                  />
                </div>
                <DialogDescription className="space-y-2">
                  {mutation.error && (
                    <p className="font-bold text-destructive">
                      {extractErrorMessage(mutation.error as ApiError)}
                    </p>
                  )}
                  <p>
                    Oops! Something went wrong while sending the invitation.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please try again or double-check the information. If the
                    problem continues, please contact our support team.
                  </p>
                </DialogDescription>
                <DialogFooter>
                  <Button onClick={handleClose}>Ok</Button>
                </DialogFooter>
              </>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default NewInvitation
