import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute } from "@tanstack/react-router"
import countries from "country-list"
import Lottie from "lottie-react"
import { Building, Globe, Lightbulb, Mail, User, Users } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import emailSent from "@/assets/email.json"
import { UsersService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
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
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional(),
  team_size: z
    .enum(["myself", "small", "medium", "large", "enterprise"])
    .optional(),
  organization: z.string().optional(),
  role: z.string().optional(),
  country: z.string().optional(),
  use_case: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

const teamSizes = [
  { label: "Myself", value: "myself" },
  { label: "<10 people", value: "small" },
  { label: "10-50 people", value: "medium" },
  { label: "50-200 people", value: "large" },
  { label: "200+ people", value: "enterprise" },
]

export const Route = createFileRoute("/waitlist")({
  component: Waitlist,
})

function Waitlist() {
  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const { showErrorToast } = useCustomToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      name: "",
      team_size: undefined,
      organization: "",
      role: "",
      country: "",
      use_case: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await UsersService.addToWaitingList({
        requestBody: data,
      })
      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch (error) {
      console.error(error)
      showErrorToast("Failed to join waitlist. Please try again later.")
    }
  }

  if (isSuccess) {
    return (
      <BackgroundPanel>
        <Card>
          <CardHeader>
            <CardTitle>Thank You!</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-4">
            <Lottie
              animationData={emailSent}
              loop={false}
              className="h-20 w-20"
            />
            <p>
              You've been added to our waitlist. We'll notify you at{" "}
              <span className="font-bold">{submittedEmail}</span> when you're
              invited to create your account.
            </p>
          </CardContent>
        </Card>
      </BackgroundPanel>
    )
  }

  return (
    <BackgroundPanel>
      <Card>
        <CardHeader>
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>Sign up to get early access</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          data-testid="email-input"
                          placeholder="user@example.com"
                          type="email"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          data-testid="full-name-input"
                          placeholder="John Doe"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Organization</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          data-testid="organization-input"
                          placeholder="Company Name"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className="w-full pl-10"
                          data-testid="team-size-select"
                        >
                          <div className="relative flex items-center">
                            <Users className="absolute left-[-20px] h-4 w-4 text-muted-foreground" />
                            <SelectValue
                              placeholder="Select team size"
                              className="text-left"
                            />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teamSizes.map((size) => (
                          <SelectItem key={size.value} value={size.value}>
                            {size.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Role</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          data-testid="role-input"
                          placeholder="Developer"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className="w-full pl-10"
                          data-testid="country-select"
                        >
                          <div className="relative flex items-center">
                            <Globe className="absolute left-[-20px] h-4 w-4 text-muted-foreground" />
                            <SelectValue
                              placeholder="Select country"
                              className="text-left"
                            />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries.getNames().map((name) => (
                          <SelectItem key={name} value={name}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="use_case"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Use Case</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lightbulb className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          data-testid="use-case-input"
                          placeholder="How do you plan to use FastAPI Cloud? (Optional)"
                          className="pl-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                Join Waitlist
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </BackgroundPanel>
  )
}
