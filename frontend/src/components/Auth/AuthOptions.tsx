import {
  AbsoluteCenter,
  Box,
  Button,
  Divider,
  HStack,
  Link,
} from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import { FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"

interface OptionsProps {
  description: string
  path: string
}

const AuthOptions = ({ description, path }: OptionsProps) => {
  return (
    <>
      <Box position="relative" py={4}>
        <Divider />
        <AbsoluteCenter bg="white" px={4}>
          or
        </AbsoluteCenter>
      </Box>
      <HStack>
        <Button leftIcon={<FcGoogle />} variant="outline" flex="1">
          Google
        </Button>
        <Button leftIcon={<FaGithub />} variant="outline" flex="1">
          Github
        </Button>
      </HStack>
      <Box>
        {`${description} `}
        <Link as={RouterLink} to={path} color="ui.main" fontWeight="bolder">
          {path === "/login" ? "Log In" : "Sign Up"}
        </Link>
      </Box>
    </>
  )
}

export default AuthOptions
