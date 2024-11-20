import { defineRecipe } from "@chakra-ui/react"

export const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    colorPalette: "cyan",
  },
  variants: {
    variant: {
      primary: {
        bg: "colorPalette.700",
        color: "white",
      },
      outline: {
        borderWidth: "1px",
        borderColor: "colorPalette.700",
        _hover: {
          borderColor: "colorPalette.600",
        },
      },
      ghost: {
        bg: "transparent",
        _hover: {
          bg: "gray.100",
        },
      },
    },
  },
})
