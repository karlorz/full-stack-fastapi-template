import { Box, type BoxProps, Heading } from "@chakra-ui/react"
import type { ReactNode } from "react"

interface CustomCardProps extends BoxProps {
  title?: string
  children: ReactNode
}

const CustomCard = ({ title, children, ...props }: CustomCardProps) => {
  return (
    <Box
      zIndex="auto"
      id="card"
      borderRadius="md"
      px={8}
      py={8}
      mb={8}
      {...props}
      gap={2}
      bg="bg.panel"
    >
      <Heading size="md" fontWeight="bold" mb={4}>
        {title}
      </Heading>
      {children}
    </Box>
  )
}

export default CustomCard
