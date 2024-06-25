import {
  Container,
  Heading,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import { useQuery } from "@tanstack/react-query"
import { Link as RouterLink } from "@tanstack/react-router"

import { TeamsService } from "../../client"

const AllTeams = () => {
  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: () => TeamsService.readTeams({}),
  })

  return (
    <Container maxW="full" p={12}>
      <Heading size="md" textAlign={{ base: "center", md: "left" }} pb={2}>
        All Teams
      </Heading>
      <Text>These are the teams you are a member of.</Text>
      <UnorderedList style={{ listStyleType: "none" }} pt={10}>
        {teams?.data.map((team) => (
          <ListItem key={team.slug} my={2}>
            <Link
              as={RouterLink}
              to={`/${team.slug}/`}
              _hover={{ color: "ui.main", textDecoration: "underline" }}
            >
              {team.name}
            </Link>
          </ListItem>
        ))}
      </UnorderedList>
    </Container>
  )
}

export default AllTeams
