import { Container, Flex, Input } from "@chakra-ui/react"

import { Button } from "../ui/button"
import { Field } from "../ui/field"

// TODO: Complete this when the functionality is implemented

const TransferTeam = () => {
  return (
    <>
      <Container maxW="full" p={0}>
        <Flex as="form" align="center" flexDir={{ base: "column", md: "row" }}>
          <Field required w={{ base: "100%", md: "250px" }}>
            <Input placeholder="Email address" type="text" />
          </Field>
          <Button
            variant="solid"
            type="submit"
            ml={{ base: 0, md: 4 }}
            display={{ base: "block", md: "inline-block" }}
            mt={{ base: 4, md: 0 }}
            alignSelf={{ base: "flex-start", md: "auto" }}
          >
            Transfer
          </Button>
        </Flex>
      </Container>
    </>
  )
}
export default TransferTeam
