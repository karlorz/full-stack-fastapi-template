import { extendTheme, textDecoration } from "@chakra-ui/react"
import { link } from "./components/Common/SidebarItems"
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
    // Gradient color for highlights
    gradient: "linear-gradient(90deg, #00667A 0%, #3B2174 100%)",

    // Brand colors
    main: {
      light: "#4BA3B0",
      dark: "#00667A",
    },
    secondary: {
      light: "#D6BCFA",
      dark: "#3B2174",
    },

    // Neutral colors
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

    // Feedback colors
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
        fontWeight: "bold",
      },
      defaultProps: {
        size: "sm",
      },
      variants: {
        primary: {
          bg: "main.dark",
          color: "white",
          _hover: {
            bg: "main.light",
            color: "white",
          },
          _active: {
            bg: "main.light",
            color: "white",
          },
          _disabled: {
            bg: "gray.200",
            color: "gray.500",
            cursor: "not-allowed",
          },
          _loading: {
            bg: "main.light",
            color: "white",
            cursor: "not-allowed",
            _hover: {
              bg: "main.light",
            },
          },
        },
        secondary: (props) => ({
          bg: props.colorMode === "dark" ? "#252525" : "gray.50",
          border: "1px solid",
          borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
          color: "main.dark",
          _hover: {
            bg: props.colorMode === "dark" ? "#333333" : "gray.100",
            borderColor: props.colorMode === "dark" ? "gray.500" : "gray.400",
          },
          _active: {
            bg: props.colorMode === "dark" ? "#444444" : "gray.200",
            borderColor: props.colorMode === "dark" ? "gray.500" : "gray.400",
          },
          _disabled: {
            bg: props.colorMode === "dark" ? "#1a1a1a" : "gray.200",
            color: props.colorMode === "dark" ? "gray.500" : "gray.400",
            borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
            cursor: "not-allowed",
          },
        }),

        tertiary: (props) => ({
          bg: props.colorMode === "dark" ? "#252525" : "gray.50",
          color: props.colorMode === "dark" ? "text.light" : "text.dark",
          border: "1px solid",
          borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
          _hover: {
            bg: props.colorMode === "dark" ? "#333333" : "gray.100",
            borderColor: props.colorMode === "dark" ? "gray.500" : "gray.400",
          },
          _active: {
            bg: props.colorMode === "dark" ? "#444444" : "gray.200",
            borderColor: props.colorMode === "dark" ? "gray.500" : "gray.400",
          },
          _disabled: {
            bg: props.colorMode === "dark" ? "#1a1a1a" : "gray.200",
            color: props.colorMode === "dark" ? "gray.500" : "gray.400",
            borderColor: props.colorMode === "dark" ? "gray.600" : "gray.300",
            cursor: "not-allowed",
          },
        }),

        danger: (props) => ({
          bg: "error.base",
          color: "text.light",
          _hover: {
            bg: props.colorMode === "dark" ? "#C33C3C" : "#E04343",
            color: "white",
          },
          _active: {
            bg: "error.dark",
            color: "text.light",
          },
          _disabled: {
            bg: "gray.300",
            color: "gray.500",
            cursor: "not-allowed",
          },
          _loading: {
            bg: "error.base",
            cursor: "not-allowed",
            color: "text.light",
            _hover: {
              bg: "error.base",
            },
          },
        }),
        text_primary: {
          textDecoration: "underline",
          color: "main.dark",
          _hover: {
            color: "main.light",
          },
          _active: {
            color: "main.light",
          },
          _disabled: {
            color: "gray.300",
          },
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            _focus: {
              borderColor: "teal.400",
              boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.5)",
            },
          },
        },
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
