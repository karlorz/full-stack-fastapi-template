import { Box, type BoxProps, Heading } from "@chakra-ui/react"
import type React from "react"

interface CustomCardProps extends BoxProps {
  title?: string
  children: React.ReactNode
}

const CustomCard = ({ title, children, ...props }: CustomCardProps) => {
  return (
    <Box id="card" borderRadius="md" px={8} py={8} mb={8} {...props} gap={2}>
      <Heading size="sm" fontWeight="bold" mb={4}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}

export default CustomCard
