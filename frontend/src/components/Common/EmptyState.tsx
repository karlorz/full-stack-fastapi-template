import { Heading, Icon, type IconProps, Text } from "@chakra-ui/react"
import type { FC } from "react"

import CustomCard from "./CustomCard"

interface EmptyStateProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  icon: FC<IconProps>
}

const EmptyState = ({ title, description, icon }: EmptyStateProps) => {
  return (
    <CustomCard
      w={{ base: "100%", md: "60%" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Icon as={icon} boxSize={icon.name === "EmptyBox" ? 10 : 6} />
      <Heading size="sm" textAlign="center">
        {title}
      </Heading>
      <Text>{description}</Text>
    </CustomCard>
  )
}

export default EmptyState
