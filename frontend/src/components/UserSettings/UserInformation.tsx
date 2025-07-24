import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Suspense, useState } from "react"
import { useForm } from "react-hook-form"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import * as z from "zod"

import { UsersService } from "@/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CustomCard } from "@/components/ui/custom-card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import useAuth, { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import DangerZoneAlert from "../Common/DangerZone"
import UpdateEmailInfo from "../Common/UpdateEmailInfo"
import PendingUserInformation from "../PendingComponents/PendingUserInformation"
import { Dialog, DialogContent } from "../ui/dialog"
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
  const [isRedirectingToGithub, setIsRedirectingToGithub] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)

  const { linkWithProvider } = useAuth()

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

  const handleConnectGithub = () => {
    setIsRedirectingToGithub(true)
    linkWithProvider("github")
  }

  return (
    <>
      <div className="space-y-10">
        <CustomCard
          title="Profile Information"
          description="Update your personal information."
        >
          <div className="flex flex-col md:flex-row gap-6">
            <Form {...nameForm}>
              <form
                onSubmit={nameForm.handleSubmit(onSubmitName)}
                className="w-full md:w-1/2 space-y-4"
              >
                <FormField
                  control={nameForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            data-testid="full-name-input"
                            {...field}
                            disabled={!isEditingName}
                            className="w-full"
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
                className="w-full md:w-1/2 space-y-4"
              >
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            data-testid="email-input"
                            {...field}
                            disabled={!isEditingEmail}
                            className="w-full"
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
        </CustomCard>

        <CustomCard
          title="Security"
          description="Manage your password and security settings."
        >
          <ChangePassword />
        </CustomCard>

        <CustomCard
          title="Connected Accounts"
          description="Manage your connected accounts and integrations."
        >
          <div className="space-y-8">
            {/* GitHub */}
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <FaGithub className="h-5 w-5 text-accent-foreground" />
                <div>
                  <h4 className="font-medium">GitHub</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.github_account
                      ? `Connected as ${currentUser?.github_account?.provider_username}`
                      : "Not connected"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnectGithub}
                  disabled={isRedirectingToGithub}
                >
                  {currentUser?.github_account
                    ? "Update GitHub Connection"
                    : "Connect to GitHub"}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Google */}
            <div className="flex items-center justify-between py-4">
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
          </div>
        </CustomCard>

        <CustomCard>
          <DangerZoneAlert description="Permanently delete your data and everything associated with your account.">
            <DeleteConfirmation />
          </DangerZoneAlert>
        </CustomCard>
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
