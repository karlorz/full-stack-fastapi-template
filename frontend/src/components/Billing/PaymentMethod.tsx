import {
  Button,
  Container,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react"
import React from "react"

const PaymentMethod = () => {
  return (
    <Container p={8} borderRadius="md">
      <HStack flexDirection={["column", "row"]}>
        <VStack gap={4} align="start">
          <Text fontSize="md" fontWeight="bold">
            Payment Method
          </Text>
          {/* TODO: Temporary image */}
          <Image
            width="50px"
            src="https://1000marcas.net/wp-content/uploads/2019/12/VISA-Logo-2014.png"
            alt="Payment Method"
          />
          <VStack gap={0}>
            <Text fontWeight="bold">**** **** **** 1234</Text>
            <Text>Exp Date: 06/2024</Text>
          </VStack>
        </VStack>
        <Spacer />
        <Button variant="outline">Update Card</Button>
      </HStack>
    </Container>
  )
}

export default PaymentMethod
