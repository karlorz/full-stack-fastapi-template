import {
  Box,
  type BoxProps,
  Divider,
  Text,
  useColorModeValue,
} from "@chakra-ui/react"
import type React from "react"

interface CustomCardProps extends BoxProps {
  title?: string
  children: React.ReactNode
}

const CustomCard = ({ title, children, ...props }: CustomCardProps) => {
  const borderColor = useColorModeValue("#e4e5eb", "#2a2a2a")

  return (
    <Box
      border={`1px solid ${borderColor}`}
      borderRadius="md"
      px={8}
      py={4}
      mb={8}
      {...props}
    >
      <Text fontWeight="bold" mb={4}>
        {title}
      </Text>
      {title && <Divider mb={4} />}
      {children}
    </Box>
  )
}

export default CustomCard
