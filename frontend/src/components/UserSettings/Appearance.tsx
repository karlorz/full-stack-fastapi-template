"use client"

import { Center } from "@chakra-ui/react"
import { ColorModeButton } from "../ui/color-mode"

const Appearance = () => {
  return (
    <>
      <Center>
        <ColorModeButton
          bg="whiteAlpha.200"
          color="whiteAlpha.900"
          _hover={{ bg: "whiteAlpha.300" }}
          aria-label="Toggle dark mode"
        />
      </Center>
    </>
  )
}

export default Appearance
