import { Center, Heading, Text } from "@chakra-ui/react"

import type { LucideIcon } from "lucide-react"
import CustomCard from "./CustomCard"

interface EmptyStateProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  icon: LucideIcon
}

const EmptyState = ({
  title,
  description,
  icon: IconComponent,
}: EmptyStateProps) => {
  return (
    <CustomCard
      w="100%"
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Center>
        <IconComponent />
      </Center>
      <Heading size="md" textAlign="center">
        {title}
      </Heading>
      <Text textAlign={{ base: "center", md: "inherit" }}>{description}</Text>
    </CustomCard>
  )
}

export default EmptyState
