import { createSystem, defaultConfig } from "@chakra-ui/react"
import "./fonts.css"
import { buttonRecipe } from "./theme/button.recipe"

export const system = createSystem(defaultConfig, {
  globalCss: {
    html: {
      fontSize: "16px",
    },
    body: {
      fontSize: "0.875rem",
      margin: 0,
      padding: 0,
    },
    ".main-link": {
      color: "main.dark",
      fontWeight: "bold",
    },
    "input:focus": {
      borderColor: "main.light",
      outline: "none",
    },
    // TODO: Remove this later. ref: https://github.com/chakra-ui/chakra-ui/pull/9523
    "input::placeholder": {
      color: "fg.muted",
    },
    h2: {
      fontSize: "1.2rem",
      fontFamily: "heading",
      fontWeight: "bold",
    },
  },
  theme: {
    tokens: {
      fonts: {
        heading: { value: "Raleway Bold, sans-serif" },
        body: { value: "Open Sans, sans-serif" },
      },
      colors: {
        // Brand colors
        gradient: { value: "linear-gradient(90deg, #00667A 0%, #3B2174 100%)" },
        main: {
          light: { value: "#4BA3B0" },
          dark: { value: "#00667A" },
        },
        secondary: {
          light: { value: "#D6BCFA" },
          dark: { value: "#3B2174" },
        },
        background: {
          light: { value: "#F9F9FA" },
          dark: { value: "#191919" },
        },
        // Neutral colors
        text: {
          light: { value: "#FAFAFA" },
          dark: { value: "#5D7285" },
        },
        // Feedback colors
        success: {
          base: { value: "#007A66" },
          light: { value: "#4EAF99" },
          dark: { value: "#006E6C" },
        },
        error: {
          base: { value: "#B0271B" },
          light: { value: "#F8D1D3" },
          dark: { value: "#7A272E" },
        },
        warning: {
          base: { value: "#B76E00" },
          light: { value: "#FBE3C2" },
          dark: { value: "#A36616" },
        },
      },
    },
    recipes: {
      button: buttonRecipe,
    },
  },
})
