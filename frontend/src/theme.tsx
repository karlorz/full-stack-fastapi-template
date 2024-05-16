import { extendTheme } from "@chakra-ui/react"
import "./fonts.css"

const disabledStyles = {
  _disabled: {
    backgroundColor: "ui.main",
  },
}

const theme = extendTheme({
  fonts: {
    heading: "Ubuntu",
    body: "Ubuntu",
  },
  colors: {
    ui: {
      main: "#009688",
      success: "#48BB78",
      danger: "#B82828",
      light: "#FAFAFA",
      dark: "#1A202C",
      darkSlate: "#252D3D",
      dim: "#CBD5E0",
      defaultText: "#5D7285",
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        color: props.colorMode === "dark" ? "ui.light" : "ui.defaultText",
      },
    }),
  },
  components: {
    Button: {
      variants: {
        primary: {
          backgroundColor: "ui.main",
          color: "ui.light",
          _hover: {
            backgroundColor: "#00766C",
          },
          _disabled: {
            ...disabledStyles,
            _hover: {
              ...disabledStyles,
            },
          },
        },
        danger: {
          backgroundColor: "ui.danger",
          color: "ui.light",
          _hover: {
            backgroundColor: "#821B1B",
          },
        },
      },
    },
    Tabs: {
      variants: {
        line: {
          tab: {
            _selected: {
              color: "ui.main",
            },
          },
        },
      },
    },
  },
})

export default theme
