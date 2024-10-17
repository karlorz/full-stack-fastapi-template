import { Box, Flex, Icon, Text } from "@chakra-ui/react"
import type { ElementType } from "react"

interface CustomToastProps {
  title: string
  description: string
  icon: ElementType
  bg: string
  color: string
}

const CustomToast = ({
  title,
  description,
  icon,
  bg,
  color,
}: CustomToastProps) => {
  return (
    <Flex p={3} bg={bg} borderRadius="md" boxShadow="md">
      <Icon as={icon} color={color} mr={2} mt={1} />
      <Box color={color}>
        <Text fontWeight="semibold">{title}</Text>
        <Text>{description}</Text>
      </Box>
    </Flex>
  )
}

export default CustomToast
