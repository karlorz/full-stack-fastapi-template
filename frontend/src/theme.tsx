import { MenuButton, background, extendTheme } from "@chakra-ui/react"
import "./fonts.css"

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Raleway Bold, sans-serif",
    body: "Open Sans, sans-serif",
  },
  colors: {
    ui: {
      gradient: "linear-gradient(90deg, #00667A 0%, #3B2174 100%)",
      main: "#00667A",
      secondary: "#3B2174",
      danger: "#B0271B",
      success: "#48BB78",
      lightBg: "#F9F9FA",
      darkBg: "#191919",
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
        backgroundColor:
          props.colorMode === "dark" ? "ui.darkBg" : "ui.lightBg",
      },
      "input::placeholder, textarea::placeholder": {
        fontSize: "0.875rem",
      },
      "#navbar": {
        backgroundColor: props.colorMode === "dark" ? "ui.darkBg" : "inherit",
      },
      "#card, #sidebar": {
        backgroundColor: props.colorMode === "dark" ? "#202020" : "#FFFEFE",
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
          bg: "#00809e",
          color: "white",
          _hover: {
            bg: "#006b82",
          },
          _active: {
            bg: "#005466",
          },
        },
        outline: (props: any) => ({
          color: props.colorMode === "dark" ? "ui.light" : "ui.defaultText",
        }),
        danger: (props: any) => ({
          backgroundColor: props.colorMode === "dark" ? "#DA4444" : "ui.danger",
          color: "ui.lightText",
          _hover: {
            backgroundColor: props.colorMode === "dark" ? "#C33C3C" : "#E04343",
            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.1)",
          },
        }),
      },
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
    basic: (props: any) => ({
      tab: {
        fontSize: "0.875rem",
        color: props.colorMode === "dark" ? "ui.lightText" : "ui.defaultText",
        backgroundColor: props.colorMode === "dark" ? "ui.darkBg" : "inherit",
        _selected: {
          bg: props.colorMode === "dark" ? "gray.700" : "gray.100",
          borderRadius: "md",
        },
      },
    }),
  },
})

export default theme
