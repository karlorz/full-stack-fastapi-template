import {
  Box,
  Group,
  Heading,
  Input,
  Text,
  createListCollection,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import Lottie from "lottie-react"
import { useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import {
  FaBuilding,
  FaGlobe,
  FaLightbulb,
  FaUser,
  FaUsers,
} from "react-icons/fa"
import { MdEmail } from "react-icons/md"

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
  const showToast = useCustomToast()

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
      showToast(
        "Error",
        "Failed to join waitlist. Please try again later.",
        "error",
      )
    }
  }

  return (
    <BackgroundPanel>
      <CustomAuthContainer onSubmit={handleSubmit(onSubmit)}>
        {isSuccess ? (
          <Box>
            <Heading textAlign="center">Thank You!</Heading>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              mt={4}
            >
              <Lottie
                animationData={emailSent}
                loop={false}
                style={{ width: 75, height: 75 }}
              />
              <Text mt={4} textAlign="center">
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
              <InputGroup
                w="100%"
                startElement={<MdEmail color="currentColor" />}
              >
                <Input
                  id="email"
                  {...register("email", {
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  type="email"
                  required
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field invalid={!!errors.name} errorText={errors.name?.message}>
              <InputGroup
                w="100%"
                startElement={<FaUser color="currentColor" />}
              >
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
              <InputGroup
                w="100%"
                startElement={<FaBuilding color="currentColor" />}
              >
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
                    collection={createListCollection({
                      items: [
                        { label: "Myself", value: "myself" },
                        { label: "<10 people", value: "small" },
                        { label: "10-50 people", value: "medium" },
                        { label: "50-200 people", value: "large" },
                        { label: "200+ people", value: "enterprise" },
                      ],
                    })}
                    value={field.value ? [field.value] : []}
                    onValueChange={({ value }) => field.onChange(value[0])}
                    onBlur={field.onBlur}
                    data-testid="team-size-select"
                  >
                    <SelectTrigger>
                      <Group display="flex" alignItems="center" flexGrow={1}>
                        <FaUsers color="currentColor" />
                        <SelectValueText placeholder="Team Size" />
                      </Group>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem item={{ label: "1-5", value: "1" }}>
                        1-5
                      </SelectItem>
                      <SelectItem item={{ label: "6-10", value: "6" }}>
                        6-10
                      </SelectItem>
                      <SelectItem item={{ label: "11-25", value: "11" }}>
                        11-25
                      </SelectItem>
                      <SelectItem item={{ label: "26-50", value: "26" }}>
                        26-50
                      </SelectItem>
                      <SelectItem item={{ label: "51-100", value: "51" }}>
                        51-100
                      </SelectItem>
                      <SelectItem item={{ label: "100+", value: "100" }}>
                        100+
                      </SelectItem>
                    </SelectContent>
                  </SelectRoot>
                )}
              />
            </Field>

            <Field invalid={!!errors.role} errorText={errors.role?.message}>
              <InputGroup
                w="100%"
                startElement={<FaUser color="currentColor" />}
              >
                <Input
                  id="role"
                  {...register("role")}
                  placeholder="Your Role"
                  type="text"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field
              invalid={!!errors.country}
              errorText={errors.country?.message}
            >
              <InputGroup
                w="100%"
                startElement={<FaGlobe color="currentColor" />}
              >
                <Input
                  id="country"
                  {...register("country")}
                  placeholder="Country"
                  type="text"
                  variant="outline"
                />
              </InputGroup>
            </Field>

            <Field
              invalid={!!errors.use_case}
              errorText={errors.use_case?.message}
            >
              <InputGroup
                w="100%"
                startElement={<FaLightbulb color="currentColor" />}
              >
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
