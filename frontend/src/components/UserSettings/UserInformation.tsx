import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import UpdateEmailInfo from "../Common/UpdateEmailInfo"
import PendingUserInformation from "../PendingComponents/PendingUserInformation"
import { Dialog, DialogContent } from "../ui/dialog"
import ChangePassword from "./ChangePassword"
import DeleteAccount from "./DeleteAccount"

const nameSchema = z.object({
  full_name: z.string().nonempty("Name is required").max(50),
})

const emailSchema = z.object({
  email: z.string().nonempty("Email is required").email(),
})

type NameFormValues = z.infer<typeof nameSchema>
type EmailFormValues = z.infer<typeof emailSchema>

const UserInformationContent = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const currentUser = useCurrentUser()
  const [isOpen, setIsOpen] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)

  const nameForm = useForm<NameFormValues>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      full_name: currentUser?.full_name ?? "",
    },
  })

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: currentUser?.email ?? "",
    },
  })

  const emailMutation = useMutation({
    mutationFn: (email: string) =>
      UsersService.requestEmailUpdate({
        requestBody: { email },
      }),
    onSuccess: () => {
      setIsOpen(true)
      setIsEditingEmail(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const fullNameMutation = useMutation({
    mutationFn: (full_name: string) =>
      UsersService.updateUserMe({
        requestBody: { full_name },
      }),
    onSuccess: () => {
      showSuccessToast("Full name updated successfully")
      setIsEditingName(false)
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmitName = (values: NameFormValues) => {
    fullNameMutation.mutate(values.full_name)
  }

  const onSubmitEmail = (values: EmailFormValues) => {
    emailMutation.mutate(values.email)
  }

  return (
    <>
      <div className="container my-4 px-0 pt-10">
        <div className="flex flex-col md:flex-row gap-4">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Full Name</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...nameForm}>
                <form
                  onSubmit={nameForm.handleSubmit(onSubmitName)}
                  className="space-y-4"
                >
                  <FormField
                    control={nameForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              data-testid="full-name-input"
                              {...field}
                              disabled={!isEditingName}
                            />
                            {!isEditingName ? (
                              <Button
                                type="button"
                                onClick={() => setIsEditingName(true)}
                              >
                                Edit
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button type="submit">Save</Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditingName(false)
                                    nameForm.reset({
                                      full_name: currentUser?.full_name ?? "",
                                    })
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
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

          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                  className="space-y-4"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              data-testid="email-input"
                              {...field}
                              disabled={!isEditingEmail}
                            />
                            {!isEditingEmail ? (
                              <Button
                                type="button"
                                onClick={() => setIsEditingEmail(true)}
                              >
                                Edit
                              </Button>
                            ) : (
                              <div className="flex gap-2">
                                <Button type="submit">Save</Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    setIsEditingEmail(false)
                                    emailForm.reset({
                                      email: currentUser?.email ?? "",
                                    })
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
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

        <Card className="mt-4 gap-0">
          <CardHeader>
            <CardTitle>Password</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Change your password here. Make sure to use a strong password.
            </CardDescription>
            <ChangePassword />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardContent>
            <DeleteAccount />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <UpdateEmailInfo />
        </DialogContent>
      </Dialog>
    </>
  )
}

const UserInformation = () => {
  return (
    <Suspense fallback={<PendingUserInformation />}>
      <UserInformationContent />
    </Suspense>
  )
}

export default UserInformation
