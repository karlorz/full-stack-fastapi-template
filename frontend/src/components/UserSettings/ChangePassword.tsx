import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { Lock } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { type UpdatePassword, UsersService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useCurrentUser } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"

const ChangePassword = () => {
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const currentUser = useCurrentUser()

  // Check if user has a password set (users from OAuth may not have one)
  const hasPassword = currentUser?.has_usable_password ?? false
  const [showPasswordForm, setShowPasswordForm] = useState(hasPassword)

  const formSchema = z
    .object({
      current_password: hasPassword
        ? z.string().min(8, "Password must be at least 8 characters")
        : z.string().optional(),
      new_password: z.string().min(8, "Password must be at least 8 characters"),
      confirm_password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      message: "Passwords do not match",
      path: ["confirm_password"],
    })

  type FormData = z.infer<typeof formSchema>

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(
        hasPassword
          ? "Password updated successfully"
          : "Password set successfully",
      )
      form.reset()
    },
    onError: handleError.bind(showErrorToast),
  })

  const onSubmit = (data: FormData) => {
    // biome-ignore lint/correctness/noUnusedVariables: we are removing the confirm_password from the values
    const { confirm_password, ...updateData } = data

    // If user has no password, don't send current_password field
    if (!hasPassword) {
      delete updateData.current_password
    }

    mutation.mutate(updateData)
  }

  return (
    <div className="w-full">
      {showPasswordForm ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {hasPassword && (
                <FormField
                  control={form.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                        Current Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative ">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <div className="min-h-[20px] mt-1">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="new_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="min-h-[20px] mt-1">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirm_password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <div className="min-h-[20px] mt-1">
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end mt-4">
              <Button type="submit" disabled={mutation.isPending}>
                {hasPassword ? "Update Password" : "Set Password"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="mb-4 flex justify-between gap-4 flex-col md:flex-row">
          <div>
            <p className="font-normal">
              You haven't set a password for your account yet.
            </p>
            <p className="text-muted-foreground">
              Set up a password to enable login with email and password.
            </p>
          </div>

          <Button onClick={() => setShowPasswordForm(true)}>
            Add Password
          </Button>
        </div>
      )}
    </div>
  )
}

export default ChangePassword
