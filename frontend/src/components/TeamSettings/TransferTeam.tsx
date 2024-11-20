import { Container, Flex, Input } from "@chakra-ui/react"

import { Button } from "../ui/button"
import { Field } from "../ui/field"

// TODO: Complete this when the functionality is implemented

const TransferTeam = () => {
  return (
    <>
      <Container maxW="full" p={0}>
        <Flex as="form" align="center">
          <Field required w="250px">
            <Input placeholder="Email address" type="text" />
          </Field>
          <Button variant="solid" type="submit" ml={4}>
            Transfer
          </Button>
        </Flex>
      </Container>
    </>
  )
}
export default TransferTeam
