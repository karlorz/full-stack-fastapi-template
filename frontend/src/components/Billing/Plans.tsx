import {
  Box,
  Button,
  Flex,
  Icon,
  List,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { FaCheckCircle } from "react-icons/fa"

import { FaCircleXmark } from "react-icons/fa6"
import { items } from "./PlansData"

const Plans = () => {
  const listItems = items.map(
    ({ value, title, description, price, features }) => (
      <Box
        border="1px solid lightgray"
        p={6}
        borderRadius="lg"
        key={value}
        bg="white"
        _hover={{ boxShadow: "sm", transform: "scale(1.05)" }}
        transition="all 0.3s ease-in-out"
        mb={6}
      >
        <VStack spacing={6}>
          <Text textTransform="uppercase" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="md" color="gray.600">
            {description}
          </Text>
          <Flex textAlign="center" flexDir="column">
            <Text fontSize="4xl" fontWeight="bold" color="ui.main">
              $ {price}
            </Text>
            <Text fontSize="sm" color="gray.500">
              per month
            </Text>
          </Flex>
          <List>
            {Object.values(features).map((feature, index) => (
              <Flex key={index} align="center">
                {feature.value ? (
                  <Icon as={FaCheckCircle} color="ui.main" />
                ) : (
                  <Icon as={FaCircleXmark} color="ui.dim" />
                )}
                <Text
                  fontSize="sm"
                  color="gray.700"
                  textDecoration={feature.value ? "none" : "line-through"}
                >
                  {feature.name}
                </Text>
              </Flex>
            ))}
          </List>
          <Button variant="outline" size="sm">
            Choose Plan
          </Button>
        </VStack>
      </Box>
    ),
  )

  return (
    <>
      <Stack direction={{ base: "column", md: "row" }} gap={10}>
        {listItems}
      </Stack>
    </>
  )
}

export default Plans
