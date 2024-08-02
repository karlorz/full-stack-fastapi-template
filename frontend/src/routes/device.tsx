import { z } from "zod"
import {
  Button,
  Container,
  Heading,
  Flex,
  Text,
  Icon,
  Box,
} from "@chakra-ui/react"
import { createFileRoute, redirect } from "@tanstack/react-router"

import { formatDate } from "date-fns"

import { useMutation } from "@tanstack/react-query"
import useCustomToast from "../hooks/useCustomToast"

import { LoginService, type ApiError } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import { useState } from "react"
import { FaExclamationTriangle } from "react-icons/fa"
import { isLoggedIn } from "../hooks/useAuth"

const deviceSearchSchema = z.object({
  code: z.string(),
})

export const Route = createFileRoute("/device")({
  component: AuthorizeDevice,
  errorComponent: CodeNotFound,
  validateSearch: (search) => deviceSearchSchema.parse(search),
  beforeLoad: async ({ location }) => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      })
    }
  },
  loaderDeps: ({ search }) => ({
    code: search.code,
  }),
  loader: async ({ deps }) => {
    return await LoginService.deviceAuthorizationInfo({
      userCode: deps.code,
    })
  },
})

function CodeNotFound() {
  return (
    <Flex
      flexDir="column"
      justifyContent="center"
      alignItems="center"
      h="100vh"
    >
      <Heading size="md">Invalid code</Heading>
      <Text>The code you provided is invalid or has expired.</Text>
    </Flex>
  )
}

function AuthorizeDevice() {
  const deviceAuthInfo = Route.useLoaderData()
  const { code } = Route.useSearch()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const showToast = useCustomToast()

  const mutation = useMutation({
    mutationFn: async () => {
      try {
        const response = await LoginService.authorizeDevice({
          requestBody: { user_code: code },
        })

        console.log(response)
        setSuccess(true)
      } catch (err) {
        setError((err as any).body.detail)
      }
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      showToast("Something went wrong.", `${errDetail}`, "error")
    },
  })
  return (
    <>
      <Flex flexDir={{ base: "column", md: "row" }} justify="center" h="100vh">
        <BackgroundPanel />
        {!success ? (
          <Container
            maxW={{ base: "xs", md: "md" }}
            flexDir="column"
            alignItems="stretch"
            justifyContent="center"
            centerContent
            gap={4}
          >
            <Heading size="md" textAlign={{ base: "center", md: "left" }}>
              Authorize FastAPI CLI
            </Heading>
            <Text>Click the button below to authorize FastAPI CLI</Text>
            <Box bg="yellow.50" p={4} borderRadius="md">
              <Icon
                as={FaExclamationTriangle}
                color="yellow.500"
                verticalAlign="middle"
              />{" "}
              This authorization was requested from{" "}
              <Text fontWeight="bold" as="span" data-testid="request-ip">
                {deviceAuthInfo.request_ip}
              </Text>{" "}
              on{" "}
              {formatDate(
                deviceAuthInfo.created_at,
                "MMMM dd, yyyy 'at' HH:mm (OOOO)",
              )}
            </Box>

            <Button
              isLoading={mutation.isPending}
              onClick={() => mutation.mutate()}
            >
              Authorize
            </Button>

            {error && <Text color="red.500">{error}</Text>}
          </Container>
        ) : (
          <Container
            maxW={{ base: "xs", md: "md" }}
            flexDir="column"
            alignItems="stretch"
            justifyContent="center"
            centerContent
            gap={4}
          >
            <Heading size="md" textAlign={{ base: "center", md: "left" }}>
              Device authorized
            </Heading>
            <Text>FastAPI CLI has been authorized successfully</Text>
          </Container>
        )}
      </Flex>
    </>
  )
}
