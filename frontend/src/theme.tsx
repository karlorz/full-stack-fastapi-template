import { background, extendTheme } from "@chakra-ui/react"
import "./fonts.css"

const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "Ubuntu, sans-serif",
    body: "Ubuntu, sans-serif",
  },
  colors: {
    ui: {
      main: "#009688",
      danger: "#FC4D4D",
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
          backgroundColor: "rgba(0, 150, 136, 1.0)",
          color: "ui.lightText",
          borderRadius: "md",
          boxShadow: "0 2px 6px rgba(0, 150, 136, 0.2)",
          _hover: {
            backgroundColor: "rgba(0, 150, 136, 0.8)",
            boxShadow: "0 4px 8px rgba(0, 150, 136, 0.3)",
          },
          _active: {
            backgroundColor: "rgba(0, 150, 136, 0.9)",
            boxShadow: "0 4px 12px rgba(0, 150, 136, 0.4)",
          },
        },
        glassmorphism: {
          backgroundColor: "rgba(250, 250, 250, 1.0)",
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderRadius: "md",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          backdropFilter: "blur(10px)",
          color: "gray.700",
          _hover: {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderColor: "rgba(255, 255, 255, 0.25)",
            color: "gray.800",
            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.1)",
          },
          _focus: {
            borderColor: "teal.400",
            boxShadow: "0 0 0 2px rgba(66, 153, 225, 0.5)",
          },
          _active: {
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            borderColor: "rgba(255, 255, 255, 0.3)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
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
    Input: {
      variants: {
        outline: {
          field: {
            borderColor: "gray.300",
            borderRadius: "md",
            boxShadow: "sm",
            _placeholder: {
              color: "gray.500",
            },
            _focus: {
              borderColor: "teal.400",
              boxShadow: "0 0 0 1px rgba(66, 153, 225, 0.5)",
            },
          },
        },
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
