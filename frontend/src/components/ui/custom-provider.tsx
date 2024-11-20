"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { system } from "../../theme"
import { ColorModeProvider } from "./color-mode"
import { Toaster } from "./toaster"

export function CustomProvider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="light">
        {props.children}
      </ColorModeProvider>
      <Toaster />
    </ChakraProvider>
  )
}
