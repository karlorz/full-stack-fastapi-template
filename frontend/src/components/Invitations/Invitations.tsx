import {
  Badge,
  Box,
  Button,
  Center,
  Container,
  Skeleton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react"
import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"
import { ErrorBoundary } from "react-error-boundary"
import { FaTimes } from "react-icons/fa"
import { InvitationsService } from "../../client/services"

function InvitationsTableBody() {
  const teamId = 1
  const { data: invitations } = useSuspenseQuery({
    queryKey: ["invitations"],
    queryFn: () =>
      InvitationsService.readInvitationsTeamByAdmin({ teamId: teamId }),
  })

  return (
    <Tbody>
      {invitations.data.map(({ id, status, email }) => (
        <Tr key={id}>
          <Td>{email}</Td>
          <Td textTransform="capitalize">
            <Badge colorScheme={status === "pending" ? "orange" : "red"}>
              {status}
            </Badge>
          </Td>
          <Td>
            <Tooltip label="Cancel Invitation">
              <Button variant="unstyled">
                <Center>
                  <FaTimes />
                </Center>
              </Button>
            </Tooltip>
          </Td>
        </Tr>
      ))}
    </Tbody>
  )
}

function InvitationsTable() {
  const headers = ["Email", "Status", "Actions"]

  return (
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
          <Suspense
            fallback={
              <Tbody>
                {new Array(3).fill(null).map((_, index) => (
                  <Tr key={index}>
                    <Td colSpan={5}>
                      <Box width="100%">
                        <Skeleton height="20px" />
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            }
          >
            <InvitationsTableBody />
          </Suspense>
        </ErrorBoundary>
      </Table>
    </TableContainer>
  )
}

function Invitations() {
  return (
    <>
      <Container maxW="full">
        <InvitationsTable />
      </Container>
    </>
  )
}

export default Invitations
