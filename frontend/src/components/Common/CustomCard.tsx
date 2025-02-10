import { type BoxProps, Card } from "@chakra-ui/react"
import type { ReactNode } from "react"

interface CustomCardProps extends BoxProps {
  title?: string
  children: ReactNode
}

const CustomCard = ({ title, children, ...props }: CustomCardProps) => {
  return (
    <>
      <Card.Root
        borderRadius="md"
        bg="bg.panel"
        border="none"
        mb={8}
        {...props}
        id="card"
      >
        <Card.Body gap={2} justifyContent="center">
          {title && (
            <Card.Title fontSize="sm" mt={2}>
              {title}
            </Card.Title>
          )}
          {children}
        </Card.Body>
      </Card.Root>
    </>
  )
}

export default CustomCard
