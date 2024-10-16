import { Container } from "@chakra-ui/react"
import type { FormEventHandler, ReactNode } from "react"

interface CustomAuthContainerProps {
  onSubmit?: FormEventHandler<HTMLDivElement>
  children: ReactNode
}

const CustomAuthContainer = ({
  onSubmit,
  children,
}: CustomAuthContainerProps) => {
  return (
    <Container
      as={onSubmit ? "form" : "div"}
      onSubmit={onSubmit}
      maxW={{ base: "md", md: "lg" }}
      p={{ base: 8, md: 12 }}
      color="ui.defaultText"
      h={{ base: "xl", lg: "3xl" }}
      maxH={{ base: "70vh", lg: "80vh" }}
      alignItems="stretch"
      justifyContent="center"
      gap={4}
      centerContent
      borderRadius="md"
      bg="ui.lightBg"
      zIndex="4"
    >
      {children}
    </Container>
  )
}

export default CustomAuthContainer
