import { Box, Circle, Container, Flex, Heading, Text } from "@chakra-ui/react"

import { Warning } from "@/assets/icons"
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
              <Warning boxSize="18px" />
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
