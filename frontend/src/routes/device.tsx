import { z } from "zod"
import { Button, Container, Heading, Flex, Text } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"

import { useMutation } from "@tanstack/react-query"
import useCustomToast from "../hooks/useCustomToast"

import { LoginService, type ApiError } from "../client"
import BackgroundPanel from "../components/Auth/BackgroundPanel"
import { useState } from "react"

const deviceSearchSchema = z.object({
  code: z.string(),
})

export const Route = createFileRoute("/device")({
  component: AuthorizeDevice,
  validateSearch: (search) => deviceSearchSchema.parse(search),
})

function AuthorizeDevice() {
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
