import { Box, Flex, Text } from "@chakra-ui/react"

import Bg from "/assets/images/background.svg"

const BackgroundPanel = () => {
  return (
    <>
      <Box
        backgroundImage={`url(${Bg})`}
        backgroundPosition="center"
        backgroundSize="cover"
        w={{ base: "100%", md: "55%" }}
      >
        <Flex
          display={{ base: "none", md: "flex" }}
          flexDir="column"
          justify="center"
          color="ui.light"
          h="100%"
          p={8}
        >
          <Text fontSize="4xl" fontWeight="bolder">
            FastAPI Cloud
          </Text>
          <Text fontSize="lg">The fastest way to deploy your FastAPI app</Text>
        </Flex>
      </Box>
    </>
  )
}

export default BackgroundPanel
