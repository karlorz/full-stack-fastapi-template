import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Text,
} from "@chakra-ui/react"

const TransferTeam = () => {
  return (
    <>
      <Container maxW="full">
        <Box as="form">
          <Text py={2} mb={2}>
            Transfer the team ownership to other user.
          </Text>
          <FormControl isRequired>
            <FormLabel htmlFor="email" hidden>
              Email address
            </FormLabel>
            <Input
              id="email"
              placeholder="Email address"
              type="text"
              w="auto"
            />
          </FormControl>
          <Button variant="primary" type="submit" mt={4}>
            Transfer
          </Button>
        </Box>
      </Container>
    </>
  )
}
export default TransferTeam
