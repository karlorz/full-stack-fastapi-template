import {
  Box,
  Button,
  Flex,
  Icon,
  List,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react"
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleXmark } from "react-icons/fa6"

import { items } from "./PlansData"

const Plans = () => {
  const borderColor = useColorModeValue("#e4e5eb", "#2a2a2a")

  const listItems = items.map(
    ({ value, title, description, price, features }) => (
      <Box
        border={`1px solid ${borderColor}`}
        p={8}
        borderRadius="md"
        key={value}
        _hover={{ boxShadow: "sm", transform: "scale(1.05)" }}
        transition="all 0.3s ease-in-out"
        mb={8}
        flex="1"
      >
        <VStack spacing={6}>
          <Box p={4} w="full" textAlign="center">
            <Text textTransform="uppercase" fontWeight="bold">
              {title}
            </Text>
          </Box>
          <Text fontSize="md">{description}</Text>
          <Flex textAlign="center" flexDir="column">
            <Text fontSize="4xl" fontWeight="bold">
              $ {price}
            </Text>
            <Text fontSize="sm">per month</Text>
          </Flex>
          <List>
            {Object.values(features).map((feature, index) => (
              <Flex key={index} align="center">
                {feature.value ? (
                  <Icon as={FaCheckCircle} color="main.dark" />
                ) : (
                  <Icon as={FaCircleXmark} color="icon.base" />
                )}
                <Text
                  fontSize="sm"
                  textDecoration={feature.value ? "none" : "line-through"}
                  ml={2}
                >
                  {feature.name}
                </Text>
              </Flex>
            ))}
          </List>
          <Button variant="secondary" mt={6}>
            Choose Plan
          </Button>
        </VStack>
      </Box>
    ),
  )

  return (
    <Flex direction={{ base: "column", md: "row" }} gap={10}>
      {listItems}
    </Flex>
  )
}

export default Plans
