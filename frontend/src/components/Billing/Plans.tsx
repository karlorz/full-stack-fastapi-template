import {
  Box,
  Flex,
  List,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { FaCheckCircle } from "react-icons/fa"

const items = [
  {
    value: "1",
    title: "Basic",
    description: "For small teams and early-stage startups.",
    price: "5",
  },
  {
    value: "2",
    title: "Advanced",
    description: "For larger teams and established companies.",
    price: "18",
  },
  {
    value: "3",
    title: "Enterprise",
    description: "For large organizations with advanced needs.",
    price: "32",
  },
]

const Plans = () => {
  const listItems = items.map(({ value, title, description, price }) => (
    <Box border="1px solid lightgray" p={4} borderRadius="16px" key={value}>
      <VStack spacing={4}>
        <Radio value={value} colorScheme="teal">
          {title}
        </Radio>
        <Text fontSize="sm">{description}</Text>
        <Flex textAlign="center" flexDir="column">
          <Text fontSize="xl" color="ui.main">
            $ {price}
          </Text>
          <Text fontSize="sm">per user/month</Text>
        </Flex>
        <List>
          <Text fontSize="sm" display="flex" gap={2}>
            <FaCheckCircle />
            Up to 10 users
          </Text>
          <Text fontSize="sm" display="flex" gap={2}>
            <FaCheckCircle />
            Basic support
          </Text>
          <Text fontSize="sm" display="flex" gap={2}>
            <FaCheckCircle />
            Unlimited projects
          </Text>
        </List>
      </VStack>
    </Box>
  ))
  return (
    <>
      <RadioGroup>
        <Stack direction={{ base: "column", md: "row" }} gap={10}>
          {listItems}
        </Stack>
      </RadioGroup>
    </>
  )
}

export default Plans
