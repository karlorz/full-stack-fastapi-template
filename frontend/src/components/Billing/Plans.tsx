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
      <Box border="1px solid lightgray" p={4} borderRadius="lg" key={value}>
        <VStack spacing={4}>
          <Text textTransform="uppercase" fontWeight="bold">
            {title}
          </Text>
          <Text fontSize="sm">{description}</Text>
          <Flex textAlign="center" flexDir="column">
            <Text fontSize="4xl" fontWeight="bold" color="ui.main">
              $ {price}
            </Text>
            <Text fontSize="sm">per month</Text>
          </Flex>
          <List>
            {Object.values(features).map((feature, index) => (
              <Text
                key={index}
                fontSize="sm"
                display="flex"
                alignItems="center"
                textDecoration={feature.value ? "none" : "line-through"}
                gap={2}
              >
                {feature.value ? (
                  <Icon as={FaCheckCircle} color="ui.main" />
                ) : (
                  <Icon as={FaCircleXmark} color="ui.dim" />
                )}

                {feature.name}
              </Text>
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
