import {
  Button,
  Container,
  HStack,
  Image,
  Spacer,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react"

const PaymentMethod = () => {
  const borderColor = useColorModeValue("#e4e5eb", "#2a2a2a")

  return (
    <Container p={8} borderRadius="md" border={`1px solid ${borderColor}`}>
      <HStack flexDirection={["column", "row"]}>
        <VStack spacing={4} align="start">
          <Text fontSize="md" fontWeight="bold">
            Payment Method
          </Text>
          {/* TODO: Temporary image */}
          <Image
            width="50px"
            src="https://1000marcas.net/wp-content/uploads/2019/12/VISA-Logo-2014.png"
            alt="Payment Method"
          />
          <VStack spacing={0}>
            <Text fontWeight="bold">**** **** **** 1234</Text>
            <Text>Exp Date: 06/2024</Text>
          </VStack>
        </VStack>
        <Spacer />
        <Button variant="outline" size="sm" fontSize="sm">
          Update Card
        </Button>
      </HStack>
    </Container>
  )
}

export default PaymentMethod
