import { extendTheme } from "@chakra-ui/react"
import "./fonts.css"

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Raleway Bold, sans-serif",
    body: "Open Sans, sans-serif",
  },
  colors: {
    gradient: "linear-gradient(90deg, #00667A 0%, #3B2174 100%)",
    main: {
      light: "#4BA3B0",
      dark: "#00667A",
    },
    secondary: {
      light: "#D6BCFA",
      dark: "#3B2174",
    },
    background: {
      light: "#F9F9FA",
      dark: "#191919",
    },
    text: {
      light: "#FAFAFA",
      dark: "#5D7285",
    },
    icon: {
      base: "#CBD5E0",
    },
    success: {
      base: "#007A66",
      light: "#4EAF99",
      dark: "#006E6C",
    },
    error: {
      base: "#B0271B",
      light: "#F8D1D3",
      dark: "#7A272E",
    },
    warning: {
      base: "#B76E00",
      light: "#FBE3C2",
      dark: "#A36616",
    },
  },
  styles: {
    global: (props) => ({
      html: {
        fontSize: "16px",
      },
      body: {
        fontSize: "0.875rem",
        color: props.colorMode === "dark" ? "text.light" : "text.dark",
        backgroundColor:
          props.colorMode === "dark" ? "background.dark" : "background.light",
      },
      "input::placeholder, textarea::placeholder": {
        fontSize: "0.875rem",
      },
      "#navbar": {
        backgroundColor:
          props.colorMode === "dark" ? "background.dark" : "inherit",
      },
      "#card, #sidebar": {
        backgroundColor: props.colorMode === "dark" ? "#202020" : "#FFFEFE",
      },
    }),
  },
  components: {
    AlertDialog: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === "dark" ? "background.dark" : "white",
        },
      }),
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === "dark" ? "background.dark" : "white",
        },
      }),
    },
    Drawer: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === "dark" ? "background.dark" : "white",
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
        outline: (props) => ({
          color: props.colorMode === "dark" ? "text.light" : "text.dark",
        }),
        danger: (props) => ({
          backgroundColor:
            props.colorMode === "dark" ? "#DA4444" : "error.base",
          color: "text.light",
          _hover: {
            backgroundColor: props.colorMode === "dark" ? "#C33C3C" : "#E04343",
            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.1)",
          },
        }),
      },
    },
    Popover: {
      baseStyle: (props) => ({
        content: {
          bg: props.colorMode === "dark" ? "background.dark" : "white",
        },
      }),
    },
    Tabs: {
      variants: {
        enclosed: (props) => ({
          tab: {
            fontSize: "0.875rem",
            color: props.colorMode === "dark" ? "text.light" : "text.dark",
            _selected: {
              color: props.colorMode === "dark" ? "text.light" : "main.light",
            },
          },
        }),
      },
    },
  },
})

export default theme
