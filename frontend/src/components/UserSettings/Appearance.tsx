import { Center, IconButton, useColorMode } from "@chakra-ui/react"

import { Moon, Sun } from "@/assets/icons.tsx"

const Appearance = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <>
      <Center>
        <IconButton
          bg="whiteAlpha.200"
          color="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.300" }}
          aria-label="Toggle dark mode"
          icon={colorMode === "light" ? <Moon /> : <Sun />}
          onClick={toggleColorMode}
        />
      </Center>
    </>
  )
}

export default Appearance
