import { Box, Button, Divider, Flex, HStack, Link } from "@chakra-ui/react"
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
      <Flex align="center">
        <Divider />
        <Box textAlign="center" px={4}>
          or
        </Box>
        <Divider />
      </Flex>
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
