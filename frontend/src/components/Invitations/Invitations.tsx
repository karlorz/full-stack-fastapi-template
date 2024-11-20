import { Badge, Box, Center, Container, Flex, Table } from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { EmailPending } from "@/assets/icons"
import { InvitationsService } from "@/client/services"
import { Button } from "@/components//ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
      {(invitationsData?.length ?? 0) > 0 ? (
        <Container maxW="full" p={0}>
          <Table.Root size={{ base: "sm", md: "md" }} variant="outline">
            <Table.Header>
              <Table.Row>
                {headers.map((header) => (
                  <Table.ColumnHeader
                    key={header}
                    textTransform="capitalize"
                    width={header === "Actions" ? "20%" : "40%"}
                  >
                    {header}
                  </Table.ColumnHeader>
                ))}
              </Table.Row>
            </Table.Header>
            <ErrorBoundary
              fallbackRender={({ error }) => (
                <Table.Body>
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      Something went wrong: {error.message}
                    </Table.Cell>
                  </Table.Row>
                </Table.Body>
              )}
            >
              <Table.Body>
                {isLoading ? (
                  <>
                    {new Array(3).fill(null).map((_, index) => (
                      <Table.Row key={index}>
                        <Table.Cell colSpan={5}>
                          <Box width="100%">
                            <Skeleton height="20px" />
                          </Box>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </>
                ) : (
                  invitationsData?.map(({ id, status, email }) => (
                    <Table.Row key={id} opacity={isPlaceholderData ? 0.5 : 1}>
                      <Table.Cell truncate maxWidth="200px">
                        {email}
                      </Table.Cell>
                      <Table.Cell textTransform="capitalize">
                        <Badge colorScheme="orange">{status}</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <CancelInvitation id={id} />
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </ErrorBoundary>
          </Table.Root>
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
                disabled={!hasPreviousPage}
              >
                Previous
              </Button>
              <span>Page {page}</span>
              <Button
                disabled={!hasNextPage}
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
