import { Center, IconButton, useColorMode } from "@chakra-ui/react"
import { FaMoon, FaSun } from "react-icons/fa"

const Appearance = () => {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <>
      <Center>
        <IconButton
          aria-label="Toggle dark mode"
          icon={colorMode === "light" ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          variant="outline"
        />
      </Center>
    </>
  )
}

export default Appearance
