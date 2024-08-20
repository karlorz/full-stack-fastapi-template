import {
  Box,
  Button,
  Center,
  Code,
  Container,
  Flex,
  Heading,
  Image,
  Link,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Link as RouterLink,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router"
import { z } from "zod"

import { useEffect } from "react"
import EmptyBox from "/assets/images/empty-box.jpg"
import { AppsService } from "../../../../client"

const appsSearchSchema = z.object({
  page: z.number().catch(1).optional(),
  orderBy: z.enum(["created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  teamSlug: z.string().optional(),
})

export const Route = createFileRoute("/_layout/$team/apps/")({
  component: Apps,
  validateSearch: (search) => appsSearchSchema.parse(search),
})

const PER_PAGE = 5

function getAppsQueryOptions({
  page,
  orderBy,
  order,
  teamSlug,
}: {
  page: number
  orderBy?: "created_at"
  order?: "asc" | "desc"
  teamSlug: string
}) {
  return {
    queryFn: () =>
      AppsService.readApps({
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
        orderBy,
        order,
        teamSlug,
      }),
    queryKey: ["apps", { page, orderBy, order, teamSlug }],
  }
}

function Apps() {
  const queryClient = useQueryClient()
  const { team: teamSlug } = Route.useParams()
  console.log("teamSlug", teamSlug)

  const { page = 1, orderBy, order } = Route.useSearch()
  const navigate = useNavigate({ from: Route.fullPath })
  const setPage = (page: number) =>
    navigate({ search: (prev) => ({ ...prev, page }) })

  const {
    data: apps,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getAppsQueryOptions({ page, orderBy, order, teamSlug }),
    placeholderData: (prevData) => prevData,
  })

  const hasNextPage = !isPlaceholderData && apps?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getAppsQueryOptions({ page: page + 1, orderBy, order, teamSlug }),
      )
    }
  }, [page, queryClient, hasNextPage])

  return (
    <Container maxW="full">
      <Heading size="md" textAlign={{ base: "center", md: "left" }} mb={6}>
        Apps
      </Heading>
      {apps?.data?.length ? (
        <>
          <TableContainer data-testid="apps-table">
            <Table size={{ base: "sm", md: "md" }}>
              <Thead>
                <Tr>
                  <Th>Name</Th>
                </Tr>
              </Thead>
              {isPending ? (
                <Tbody>
                  {new Array(5).fill(null).map((_, index) => (
                    <Tr key={index}>
                      {new Array(1).fill(null).map((_, index) => (
                        <Td key={index}>
                          <Box width="20%">
                            <Skeleton height="20px" />
                          </Box>
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              ) : (
                <Tbody>
                  {apps?.data.map((app) => (
                    <Tr key={app.id} opacity={isPlaceholderData ? 0.5 : 1}>
                      <Td>
                        <Link
                          as={RouterLink}
                          to={`/$team/${app.slug}/`}
                          _hover={{
                            color: "ui.main",
                            textDecoration: "underline",
                          }}
                          display="inline-block"
                          minW="20%"
                        >
                          {app.name}
                        </Link>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              )}
            </Table>
          </TableContainer>
          <Flex
            gap={4}
            alignItems="center"
            mt={4}
            direction="row"
            justifyContent="flex-end"
          >
            <Button
              onClick={() => setPage(page - 1)}
              isDisabled={!hasPreviousPage}
            >
              Previous
            </Button>
            <span>Page {page}</span>
            <Button isDisabled={!hasNextPage} onClick={() => setPage(page + 1)}>
              Next
            </Button>
          </Flex>
        </>
      ) : (
        <Flex direction={{ base: "column", md: "row" }} gap={4}>
          <Box
            w={{ base: "100%", md: "70%" }}
            mb={{ base: 4, md: 0 }}
            boxShadow="xs"
            borderRadius="lg"
            px={8}
            py={4}
          >
            <Center>
              {/* TODO: Replace image */}
              <Image
                w={{ base: "100%", md: "25%" }}
                src={EmptyBox}
                alt="Empty state"
                alignSelf="center"
              />
            </Center>
            <Text textAlign="center" mb={2}>
              You don't have any apps yet
            </Text>
            <Center>
              <Button as={RouterLink} to="/$team/apps/new">
                Create App
              </Button>
            </Center>
          </Box>
          <Box
            w={{ base: "100%", md: "30%" }}
            boxShadow="xs"
            borderRadius="lg"
            px={8}
            py={4}
          >
            <VStack spacing={4} align="flex-start">
              <Heading size="md">Quick Start with FastAPI CLI</Heading>
              <Text>
                FastAPI CLI is your primary tool for managing your apps. Before
                you start, make sure you have FastAPI CLI installed on your
                machine. You can install it using pip:
              </Text>
              <Text>
                <Code>pip install fastapi-cli</Code>
              </Text>
              <Heading size="sm">Getting started:</Heading>
              <Text>
                1. Initialize your app: <Code>fastapi init</Code>
              </Text>
              <Text>
                2. Deploy your app: <Code>fastapi deploy</Code>
              </Text>
              <Text>
                You can learn more in the{" "}
                <Link color="ui.main" href="https://fastapi.tiangolo.com/">
                  FastAPI CLI documentation
                </Link>
                .
              </Text>
            </VStack>
          </Box>
        </Flex>
      )}
    </Container>
  )
}

export default Apps
