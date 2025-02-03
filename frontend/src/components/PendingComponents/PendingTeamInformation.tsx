import { Container, Skeleton } from "@chakra-ui/react"
import CustomCard from "../Common/CustomCard"

const PendingTeamInformation = () => (
  <Container maxW="full" my={4} px={0} pt={10}>
    <CustomCard title="Team Name">
      <Skeleton h="20px" w={{ base: "100%", md: "50%" }} />
    </CustomCard>
  </Container>
)

export default PendingTeamInformation
