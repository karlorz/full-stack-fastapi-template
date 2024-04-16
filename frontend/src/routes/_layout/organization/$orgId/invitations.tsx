import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  Heading,
  Icon,
  Input,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tr,
} from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { FaEnvelope } from "react-icons/fa"

export const Route = createFileRoute(
  "/_layout/organization/$orgId/invitations",
)({
  component: Invitations,
})

const users = [
  {
    id: 1,
    email: "user@domain.com",
    status: "Pending",
  },
  {
    id: 2,
    email: "user2@domain.com",
    status: "Pending",
  },
  {
    id: 3,
    email: "user3@domain.com",
    status: "Pending",
  },
  {
    id: 4,
    email: "user3@domain.com",
    status: "Pending",
  },
]

function Invitations() {
  return (
    <>
      <Container maxW="full" p={12}>
        <Heading size="md" textAlign={{ base: "center", md: "left" }}>
          FastAPI Labs Inc.
        </Heading>
        <Flex
          flexDir={{ base: "column", md: "row" }}
          justifyContent="space-between"
          py={8}
        >
          <Flex
            flexDir="column"
            h="auto"
            textAlign={{ base: "center", md: "left" }}
          >
            <Heading size="sm" textTransform="uppercase" mb={8}>
              New Invitation
            </Heading>
            <Box as="form">
              <Text>Invite someone to join your organization.</Text>
              <FormControl>
                <Input
                  id="title"
                  placeholder="Email address"
                  type="text"
                  w="auto"
                  my={4}
                />
              </FormControl>
              <Button variant="primary" type="submit">
                Send invitation
              </Button>
            </Box>
          </Flex>
          <Flex flexDir="column" w={{ base: "100%", md: "50%" }}>
            <Heading size="sm" textTransform="uppercase" mb={8}>
              Invitations
            </Heading>
            <TableContainer>
              <Table>
                <Tbody>
                  {users.map((user) => (
                    <Tr key={user.id}>
                      <Td>
                        <Icon
                          as={FaEnvelope}
                          color="ui.dim"
                          mr={2}
                          verticalAlign="middle"
                        />
                        {user.email}
                      </Td>
                      <Td>{user.status}</Td>
                      <Td>
                        <Button>Cancel</Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Flex>
        </Flex>
      </Container>
    </>
  )
}
