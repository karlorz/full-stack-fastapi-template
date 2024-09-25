import EmptyBox from "@/assets/empty-box.svg"
import { Button, Heading, Image, Text } from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import CustomCard from "./CustomCard"

interface EmptyStateProps {
  type: string
}

const EmptyState = ({ type }: EmptyStateProps) => {
  return (
    <CustomCard
      w={{ base: "100%", md: "60%" }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      flexDirection="column"
      gap="4"
    >
      <Image src={EmptyBox} alt="Empty box" w="50px" />
      <Heading size="sm" textAlign="center">
        You don't have any {type} yet
      </Heading>
      <Text>
        Create your first {type} to get started and deploy it to the cloud.
      </Text>
      <Button as={RouterLink} to="/$team/apps/new" variant="primary">
        Create {`${type[0].toLocaleUpperCase()}${type.slice(1)}`}
      </Button>
    </CustomCard>
  )
}

export default EmptyState
