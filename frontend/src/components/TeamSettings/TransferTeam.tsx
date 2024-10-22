import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react"

// TODO: Complete this when the functionality is implemented

const TransferTeam = () => {
  return (
    <>
      <Container maxW="full" p={0}>
        <Flex as="form" align="center">
          <FormControl isRequired w="250px">
            <FormLabel htmlFor="email" hidden>
              Email address
            </FormLabel>
            <Input id="email" placeholder="Email address" type="text" />
          </FormControl>
          <Button variant="text_primary" type="submit" ml={4}>
            Transfer
          </Button>
        </Flex>
      </Container>
    </>
  )
}
export default TransferTeam
