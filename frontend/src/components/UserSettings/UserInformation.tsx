import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Key, Mail, User } from "lucide-react"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
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
import DangerZoneAlert from "../Common/DangerZone"
import UpdateEmailInfo from "../Common/UpdateEmailInfo"
import PendingUserInformation from "../PendingComponents/PendingUserInformation"
import { Badge } from "../ui/badge"
import { Dialog, DialogContent } from "../ui/dialog"
import { Label } from "../ui/label"
import ChangePassword from "./ChangePassword"
import DeleteConfirmation from "./DeleteConfirmation"

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
    onSettled: () => queryClient.invalidateQueries(),
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
    onSettled: () => queryClient.invalidateQueries(),
  })

  const onSubmitName = (values: NameFormValues) => {
    fullNameMutation.mutate(values.full_name)
  }

  const onSubmitEmail = (values: EmailFormValues) => {
    emailMutation.mutate(values.email)
  }

  return (
    <>
      <div className="pt-10 space-y-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Form {...nameForm}>
                <form
                  onSubmit={nameForm.handleSubmit(onSubmitName)}
                  className="flex-1"
                >
                  <FormField
                    control={nameForm.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="full-name-input">Full Name</Label>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              id="full-name-input"
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
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onSubmitEmail)}
                  className="flex-1"
                >
                  <FormField
                    control={emailForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <Label htmlFor="email-input">Email</Label>
                        <FormControl>
                          <div className="flex gap-2">
                            <Input
                              id="email-input"
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your password and security settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChangePassword />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Connected Accounts
            </CardTitle>
            <CardDescription>
              Manage your social login connections and integrations.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FaGithub className="h-5 w-5 text-gray-700" />
                <div>
                  <h4 className="font-medium">GitHub</h4>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>
                <Button variant="outline" size="sm" disabled>
                  Connect
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FcGoogle className="h-5 w-5" />
                <div>
                  <h4 className="font-medium">Google</h4>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>
                <Button variant="outline" size="sm" disabled>
                  Connect
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <DangerZoneAlert description="Permanently delete your data and everything associated with your account">
              <DeleteConfirmation />
            </DangerZoneAlert>
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
