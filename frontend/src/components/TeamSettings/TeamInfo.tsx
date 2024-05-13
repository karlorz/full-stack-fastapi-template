import {
  Box,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Text,
} from "@chakra-ui/react"

const TeamInfo = () => {
  return (
    <Container maxW="full" m={4}>
      <Heading size="sm" pt={6}>
        Team Information
      </Heading>
      <Text py={2}>See information regarding your team.</Text>
      <Box boxShadow="xs" px={8} py={4} borderRadius="lg">
        <Box my={4}>
          <FormControl id="email">
            <FormLabel fontWeight="bold">Team Name</FormLabel>
            <Text>Team H.R</Text>
          </FormControl>
        </Box>
      </Box>
    </Container>
  )
}

export default TeamInfo
