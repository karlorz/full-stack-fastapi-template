import { extendTheme } from "@chakra-ui/react"
import "./fonts.css"

const theme = extendTheme({
  fonts: {
    heading: "Ubuntu, sans-serif",
    body: "Ubuntu, sans-serif",
  },
  colors: {
    ui: {
      main: "#009688",
      danger: "#F56565",
      success: "#48BB78",
      lightBg: "#fdfdfd",
      darkBg: "#191919",
      lightBorder: "#e4e5eb",
      darkBorder: "#2a2a2a",
      lightText: "#FAFAFA",
      defaultText: "#5D7285",
      dim: "#CBD5E0",
    },
  },
  styles: {
    global: (props: any) => ({
      html: {
        fontSize: "16px",
      },
      body: {
        fontSize: "0.875rem",
        color: props.colorMode === "dark" ? "ui.lightText" : "ui.defaultText",
        backgroundColor: props.colorMode === "dark" ? "ui.darkBg" : "inherit",
      },
      "input::placeholder, textarea::placeholder": {
        fontSize: "0.875rem",
      },
      "#navbar": {
        backgroundColor: props.colorMode === "dark" ? "ui.darkBg" : "inherit",
      },
    }),
  },
  components: {
    AlertDialog: {
      baseStyle: (props: any) => ({
        container: {
          bg: props.colorMode === "dark" ? "ui.darkBg" : "white",
        },
      }),
    },
    Modal: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === "dark" ? "ui.darkBg" : "white",
        },
      }),
    },
    Drawer: {
      baseStyle: (props: any) => ({
        dialog: {
          bg: props.colorMode === "dark" ? "ui.darkBg" : "white",
        },
      }),
    },
    Badge: {
      baseStyle: {
        textTransform: "capitalize",
        borderRadius: "md",
      },
    },
    Button: {
      baseStyle: {
        borderRadius: "md",
      },
      defaultProps: {
        size: "sm",
      },
      variants: {
        primary: {
          backgroundColor: "ui.main",
          color: "ui.lightText",
          _hover: {
            backgroundColor: "#00766C",
          },
        },
        secondary: (props: any) => ({
          backgroundColor: props.colorMode === "dark" ? "gray.700" : "gray.500",
          color: "ui.lightText",
          _hover: {
            backgroundColor:
              props.colorMode === "dark" ? "gray.600" : "gray.400",
          },
        }),
        outline: (props: any) => ({
          color: props.colorMode === "dark" ? "white" : "ui.defaultText",
        }),
        danger: (props: any) => ({
          backgroundColor: props.colorMode === "dark" ? "red.700" : "red.600",
          color: "ui.lightText",
          _hover: {
            backgroundColor: props.colorMode === "dark" ? "red.600" : "red.500",
          },
        }),
      },
    },
    Popover: {
      baseStyle: (props: any) => ({
        content: {
          bg: props.colorMode === "dark" ? "ui.darkBg" : "white",
        },
      }),
    },
    Tabs: {
      variants: {
        basic: (props: any) => ({
          tab: {
            fontSize: "0.875rem",
            color:
              props.colorMode === "dark" ? "ui.lightText" : "ui.defaultText",
            backgroundColor:
              props.colorMode === "dark" ? "ui.darkBg" : "inherit",
            _selected: {
              bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
              borderRadius: "md",
            },
          },
        }),
      },
    },
  },
})

export default theme
