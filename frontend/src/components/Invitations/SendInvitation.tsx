import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react"

const SendInvitation = () => {
  return (
    <Flex
      textAlign={{ base: "center", md: "left" }}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Box as="form">
        <Text>Invite someone to join your team.</Text>
        <FormControl>
          <FormLabel htmlFor="email" hidden>
            Email address
          </FormLabel>
          <Input
            id="email"
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
  )
}

export default SendInvitation
