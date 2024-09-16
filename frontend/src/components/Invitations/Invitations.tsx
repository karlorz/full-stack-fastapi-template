import {
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { ErrorBoundary } from "react-error-boundary"

import { InvitationsService } from "../../client/services"
import { Route } from "../../routes/_layout/$team"
import CancelInvitation from "./CancelInvitation"
import NewInvitation from "./NewInvitation"

const PER_PAGE = 5

const getInvitationsQueryOptions = ({
  team,
  page,
}: { team: string; page: number }) => ({
  queryKey: ["invitations", { page }],
  queryFn: () =>
    InvitationsService.readInvitationsTeamByAdmin({
      status: "pending",
      teamSlug: team,
      skip: (page - 1) * PER_PAGE,
      limit: PER_PAGE,
    }),
})

function InvitationsTable() {
  const { team } = Route.useParams()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  useEffect(() => {
    queryClient.prefetchQuery(
      getInvitationsQueryOptions({ team, page: page + 1 }),
    )
  }, [page, queryClient, getInvitationsQueryOptions, team])

  const {
    data: invitations,
    isPending,
    isPlaceholderData,
  } = useQuery({
    ...getInvitationsQueryOptions({ team, page }),
    placeholderData: (previous) => previous,
  })

  const hasNextPage =
    !isPlaceholderData && invitations?.data.length === PER_PAGE
  const hasPreviousPage = page > 1

  const headers = ["Email", "Status", "Actions"]

  return (
    <>
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
              {isPending ? (
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
              ) : (invitations?.data.length ?? 0) > 0 ? (
                invitations?.data.map(({ id, status, email }) => (
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
              ) : (
                <Tr>
                  <Td>No pending invitations</Td>
                </Tr>
              )}
            </Tbody>
          </ErrorBoundary>
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
          onClick={() => setPage((p) => p - 1)}
          isDisabled={!hasPreviousPage}
        >
          Previous
        </Button>
        <span>Page {page}</span>
        <Button isDisabled={!hasNextPage} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </Flex>
    </>
  )
}

function Invitations() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Container maxW="full" p={0}>
      <InvitationsTable />
      <Divider my={4} />
      <Button variant="primary" onClick={onOpen} mb={4}>
        New Invitation
      </Button>
      <NewInvitation isOpen={isOpen} onClose={onClose} />
    </Container>
  )
}

export default Invitations
