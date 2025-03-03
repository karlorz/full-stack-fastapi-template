import { Center, Heading, type IconProps, Text } from "@chakra-ui/react"
import type { FC } from "react"

import CustomCard from "./CustomCard"

interface EmptyStateProps {
  title: string
  description?: string
  buttonText?: string
  buttonLink?: string
  icon: FC<IconProps>
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
        <IconComponent
          boxSize={IconComponent.displayName === "EmptyBox" ? 10 : 6}
        />
      </Center>
      <Heading size="md" textAlign="center">
        {title}
      </Heading>
      <Text textAlign={{ base: "center", md: "inherit" }}>{description}</Text>
    </CustomCard>
  )
}

export default EmptyState
