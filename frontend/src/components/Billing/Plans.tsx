import { Box, Button, Flex, Icon, List, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { FaCheckCircle } from "react-icons/fa"
import { FaCircleXmark } from "react-icons/fa6"

import { items } from "./PlansData"

const Plans = () => {
  const listItems = items.map(
    ({ value, title, description, price, features }) => (
      <Box
        p={8}
        borderRadius="md"
        key={value}
        _hover={{ boxShadow: "sm", transform: "scale(1.05)" }}
        transition="all 0.3s ease-in-out"
        mb={8}
        flex="1"
      >
        <VStack gap={6}>
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
          <List.Root>
            {Object.values(features).map((feature, index) => (
              <List.Item key={index}>
                {feature.value ? (
                  <FaCheckCircle color="main.dark" />
                ) : (
                  <FaCircleXmark />
                )}
                <Text
                  fontSize="sm"
                  textDecoration={feature.value ? "none" : "line-through"}
                  ml={2}
                >
                  {feature.name}
                </Text>
              </List.Item>
            ))}
          </List.Root>
          <Button variant="solid" mt={6}>
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
