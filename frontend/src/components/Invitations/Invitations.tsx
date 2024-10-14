import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Flex,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { EmailPending } from "@/assets/icons"
import { InvitationsService } from "@/client/services"
import EmptyState from "../Common/EmptyState"
import CancelInvitation from "./CancelInvitation"

const PER_PAGE = 5

const getInvitationsQueryOptions = ({
  teamId,
  page,
}: { teamId: string; page: number }) => ({
  queryKey: ["invitations", { page }],
  queryFn: () =>
    InvitationsService.readInvitationsTeamByAdmin({
      status: "pending",
      teamId: teamId,
      skip: (page - 1) * PER_PAGE,
      limit: PER_PAGE + 1,
    }),
})

function Invitations({ teamId }: { teamId: string }) {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const {
    data: invitations,
    isLoading,
    isPlaceholderData,
  } = useQuery({
    ...getInvitationsQueryOptions({ teamId, page }),
    placeholderData: (previous) => previous,
  })

  const hasNextPage = invitations?.data.length === PER_PAGE + 1
  const invitationsData = invitations?.data.slice(0, PER_PAGE)
  const hasPreviousPage = page > 1

  // biome-ignore lint/correctness/useExhaustiveDependencies(a): getInvitationsQueryOptions does not need to be included in the dependencies
  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        getInvitationsQueryOptions({ teamId, page: page + 1 }),
      )
    }
  }, [page, queryClient, hasNextPage, teamId])

  const headers = ["Email", "Status", "Actions"]

  return (
    <>
      <Flex justifyContent="flex-end" mb={4} />
      {(invitationsData?.length ?? 0) > 0 ? (
        <Container maxW="full" p={0}>
          <TableContainer>
            <Table size={{ base: "sm", md: "md" }} variant="unstyled">
              <Thead>
                <Tr>
                  {headers.map((header) => (
                    <Th
                      key={header}
                      textTransform="capitalize"
                      width={header === "Actions" ? "20%" : "40%"}
                    >
                      {header}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <ErrorBoundary
                fallbackRender={({ error }) => (
                  <Tbody>
                    <Tr>
                      <Td colSpan={4}>Something went wrong: {error.message}</Td>
                    </Tr>
                  </Tbody>
                )}
              >
                <Tbody>
                  {isLoading ? (
                    <>
                      {new Array(3).fill(null).map((_, index) => (
                        <Tr key={index}>
                          <Td colSpan={5}>
                            <Box width="100%">
                              <Skeleton height="20px" />
                            </Box>
                          </Td>
                        </Tr>
                      ))}
                    </>
                  ) : (
                    invitationsData?.map(({ id, status, email }) => (
                      <Tr key={id} opacity={isPlaceholderData ? 0.5 : 1}>
                        <Td isTruncated maxWidth="200px">
                          {email}
                        </Td>
                        <Td textTransform="capitalize">
                          <Badge colorScheme="orange">{status}</Badge>
                        </Td>
                        <Td>
                          <CancelInvitation id={id} />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </ErrorBoundary>
            </Table>
          </TableContainer>
          {(hasPreviousPage || hasNextPage) && (
            <Flex
              gap={4}
              alignItems="center"
              mt={4}
              direction="row"
              justifyContent="flex-end"
            >
              <Button
                onClick={() => setPage((p) => p - 1)}
                isDisabled={!hasPreviousPage}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                isDisabled={!hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </Flex>
          )}
        </Container>
      ) : (
        <Center w="full">
          <EmptyState
            title="No invitations sent yet"
            description="Send invites to add members to your team and start collaborating."
            icon={EmailPending}
          />
        </Center>
      )}
    </>
  )
}

export default Invitations
