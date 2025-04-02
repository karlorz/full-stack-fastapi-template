import { Box, Circle, Container, Flex, Heading, Text } from "@chakra-ui/react"
import { TriangleAlert } from "lucide-react"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteApp = ({ appSlug, appId }: { appSlug: string; appId: string }) => {
  return (
    <>
      <Container maxW="full" p={0}>
        <Flex
          align="center"
          justify="space-between"
          flexDir={{ base: "column", md: "row" }}
        >
          <Flex
            align={{ base: "start", md: "center" }}
            gap={4}
            flexDir={{ base: "column", md: "row" }}
          >
            <Circle size="40px" bg="error.base" color="white">
              <TriangleAlert size={16} />
            </Circle>
            <Box>
              <Heading size="md" fontWeight="bold" mb={2}>
                Danger Zone
              </Heading>
              <Text>Permanently delete your app and all its data.</Text>
            </Box>
          </Flex>

          <DeleteConfirmation appId={appId} appSlug={appSlug} />
        </Flex>
      </Container>
    </>
  )
}
export default DeleteApp
