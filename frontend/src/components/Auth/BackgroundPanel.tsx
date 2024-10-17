import { Box, Flex, Image, Text } from "@chakra-ui/react"
import { type ReactNode, useEffect, useState } from "react"

import Logo from "@/assets/logo-text-white.svg"

const words = ["simplest", "smartest", "fastest"]

interface BackgroundPanelProps {
  children: ReactNode
}

const BackgroundPanel = ({ children }: BackgroundPanelProps) => {
  const [currentWord, setCurrentWord] = useState(words[0])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prevWord) => {
        const currentIndex = words.indexOf(prevWord)
        const nextIndex = (currentIndex + 1) % words.length
        return words[nextIndex]
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Flex
        flexDir={{ base: "column", lg: "row" }}
        justify="center"
        alignItems="center"
        h="100vh"
        bg="gradient"
        position="relative"
        px={8}
        gap={4}
      >
        <Box
          as="svg"
          viewBox="0 0 1440 320"
          position="absolute"
          bottom="0"
          left="0"
          zIndex="1"
        >
          <path
            fill="#ffffff"
            fillOpacity="0.3"
            d="M0,64L48,96C96,128,192,192,288,213.3C384,235,480,213,576,176C672,139,768,85,864,74.7C960,64,1056,96,1152,122.7C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path
            fill="#ffffff"
            fillOpacity="0.2"
            d="M0,160L48,170.7C96,181,192,203,288,224C384,245,480,267,576,261.3C672,256,768,224,864,186.7C960,149,1056,107,1152,106.7C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
          <path
            fill="#ffffff"
            fillOpacity="0.1"
            d="M0,224L48,208C96,192,192,160,288,144C384,128,480,128,576,154.7C672,181,768,235,864,245.3C960,256,1056,224,1152,213.3C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </Box>
        <Box w={{ base: "100%", md: "55%" }}>
          <Flex
            flexDir="column"
            align={{ base: "center", lg: "flex-start" }}
            color="text.light"
            p={{ base: 4, md: 8 }}
            textAlign={{ base: "center", lg: "left" }}
            width="100%"
            gap={10}
          >
            <Image src={Logo} alt="Logo" w="xs" />
            <Text fontSize={{ base: "3xl", lg: "6xl" }} fontWeight="bold">
              The{" "}
              <Text as="span" color="secondary.light">
                {currentWord}
              </Text>{" "}
              <br />
              way to deploy your <br />
              FastAPI app
            </Text>
          </Flex>
        </Box>
        {children}
        <Box
          as="footer"
          position="absolute"
          bottom="0"
          width="100%"
          textAlign="center"
          py={4}
          bg="rgba(0, 0, 0, 0.5)"
          color="white"
          zIndex="2"
        >
          © {new Date().getFullYear()} FastAPI Labs.
        </Box>
      </Flex>
    </>
  )
}

export default BackgroundPanel
