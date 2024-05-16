import { Box, Container, Flex, Heading, Text } from "@chakra-ui/react"
import Invitations from "../Invitations/Invitations"
import SendInvitation from "../Invitations/SendInvitation"
import Team from "../Teams/Team"

const TeamInfo = () => {
  return (
    <Container maxW="full" m={4}>
      <Heading size="sm">Team Information</Heading>
      <Text py={2} mb={4}>
        See information regarding your team.
      </Text>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
        <Box my={4}>
          <Text fontWeight="bold" mb={4}>
            Team Name
          </Text>
          <Text>Team H.R</Text>
        </Box>
      </Box>
      <Box>
        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Text fontWeight="bold" mb={4}>
            Team Members
          </Text>
          <Team />
        </Box>
      </Box>
      <Flex gap="8">
        <Box width="70%">
          <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
            <Text fontWeight="bold" mb={4}>
              Team Invitations
            </Text>
            <Flex>
              <Invitations />
            </Flex>
          </Box>
        </Box>

        <Box boxShadow="xs" px={8} py={4} borderRadius="lg" mb={8}>
          <Text fontWeight="bold" mb={4}>
            New Invitation
          </Text>
          <Flex>
            <SendInvitation />
          </Flex>
        </Box>
      </Flex>
    </Container>
  )
}

export default TeamInfo
