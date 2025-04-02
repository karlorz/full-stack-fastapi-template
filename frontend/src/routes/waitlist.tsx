import {
  Box,
  Group,
  Heading,
  Input,
  Text,
  createListCollection,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import countries from "country-list"
import Lottie from "lottie-react"
import { Building, Globe, Lightbulb, Mail, User, Users } from "lucide-react"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"

import emailSent from "@/assets/email.json"
import { type TeamSize, UsersService } from "@/client"
import BackgroundPanel from "@/components/Auth/BackgroundPanel"
import CustomAuthContainer from "@/components/Auth/CustomContainer"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import {
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "@/components/ui/select"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern } from "@/utils"
import { Select } from "chakra-react-select"

interface WaitlistForm {
  email: string
  name?: string
  team_size?: TeamSize
  organization?: string
  role?: string
  country?: string
  use_case?: string
}

export const Route = createFileRoute("/waitlist")({
  component: Waitlist,
})

function Waitlist() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistForm>({
    mode: "onBlur",
    criteriaMode: "all",
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

  const [isSuccess, setIsSuccess] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const { showErrorToast } = useCustomToast()

  const teamSizes = createListCollection({
    items: [
      { label: "Myself", value: "myself" },
      { label: "<10 people", value: "small" },
      { label: "10-50 people", value: "medium" },
      { label: "50-200 people", value: "large" },
      { label: "200+ people", value: "enterprise" },
    ],
  })

  const countriesCollection = createListCollection({
    items: countries.getNames().map((name: string) => ({
      label: name,
      value: name,
    })),
  })

  const onSubmit: SubmitHandler<WaitlistForm> = async (data) => {
    if (isSubmitting) return

    try {
      await UsersService.addToWaitingList({
        requestBody: {
          email: data.email,
          name: data.name,
          organization: data.organization,
          team_size: data.team_size,
          role: data.role,
          country: data.country,
          use_case: data.use_case,
        },
      })
      setSubmittedEmail(data.email)
      setIsSuccess(true)
    } catch (error) {
      console.error(error)
      showErrorToast("Failed to join waitlist. Please try again later.")
    }
  }

  return (
    <BackgroundPanel>
      <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
        {isSuccess ? (
          <Box>
            <Heading>Thank You!</Heading>
            <Box>
              <Lottie
                animationData={emailSent}
                loop={false}
                style={{ width: 75, height: 75 }}
              />
              <Text>
                You've been added to our waitlist. We'll notify you at{" "}
                <b>{submittedEmail}</b> when you're invited to create your
                account.
              </Text>
            </Box>
          </Box>
        ) : (
          <>
            <Box>
              <Heading>Join the Waitlist</Heading>
              <Text>Sign up to get early access</Text>
            </Box>

            <Field invalid={!!errors.email} errorText={errors.email?.message}>
              <InputGroup w="100%" startElement={<Mail size={16} />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  type="email"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field invalid={!!errors.name} errorText={errors.name?.message}>
              <InputGroup w="100%" startElement={<User size={16} />}>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Full Name"
                  type="text"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field
              invalid={!!errors.organization}
              errorText={errors.organization?.message}
            >
              <InputGroup w="100%" startElement={<Building size={16} />}>
                <Input
                  id="organization"
                  {...register("organization")}
                  placeholder="Organization"
                  type="text"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field
              invalid={!!errors.team_size}
              errorText={errors.team_size?.message}
            >
              <Controller
                control={control}
                name="team_size"
                render={({ field }) => (
                  <SelectRoot
                    w="100%"
                    collection={teamSizes}
                    value={field.value ? [field.value] : []}
                    onValueChange={({ value }) => field.onChange(value[0])}
                    onBlur={field.onBlur}
                    data-testid="team-size-select"
                  >
                    <SelectTrigger>
                      <Group display="flex" alignItems="center" flexGrow={1}>
                        <Users color="fg.subtle" size="sm" />
                        <SelectValueText placeholder="Team Size" />
                      </Group>
                    </SelectTrigger>
                    <SelectContent>
                      {teamSizes.items.map((item) => (
                        <SelectItem item={item} key={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </SelectRoot>
                )}
              />
            </Field>

            <Field invalid={!!errors.role} errorText={errors.role?.message}>
              <InputGroup w="100%" startElement={<User size={16} />}>
                <Input
                  id="role"
                  placeholder="Your Role"
                  type="text"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field
              invalid={!!errors.country}
              errorText={errors.country?.message}
              data-testid="country-select"
            >
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select
                    options={countriesCollection.items}
                    value={countriesCollection.items.find(
                      (option) => option.value === field.value,
                    )}
                    onChange={(selectedOption) =>
                      field.onChange(selectedOption?.value)
                    }
                    placeholder={
                      <>
                        <Globe color="fg.subtle" size={16} />
                        Select Country
                      </>
                    }
                  />
                )}
              />
            </Field>

            <Field
              invalid={!!errors.use_case}
              errorText={errors.use_case?.message}
            >
              <InputGroup w="100%" startElement={<Lightbulb size={16} />}>
                <Input
                  id="use_case"
                  {...register("use_case")}
                  placeholder="How do you plan to use FastAPI Cloud? (Optional)"
                  type="text"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Button
              variant="solid"
              type="submit"
              loading={isSubmitting}
              size="md"
            >
              Join Waitlist
            </Button>
          </>
        )}
      </CustomAuthContainer>
    </BackgroundPanel>
  )
}
