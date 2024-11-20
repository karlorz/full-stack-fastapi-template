import { Box, Button, Flex, HStack, Link, Separator } from "@chakra-ui/react"
import { Link as RouterLink } from "@tanstack/react-router"
import React from "react"
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
        <Separator />
        <Box textAlign="center" px={4}>
          or
        </Box>
        <Separator />
      </Flex>
      <HStack>
        <Button variant="outline" flex="1">
          <FcGoogle /> Google
        </Button>
        <Button variant="outline" flex="1">
          <FaGithub />
          Github
        </Button>
      </HStack>
      <Box>
        {`${description} `}
        <RouterLink className="main-link" to={path}>
          {path === "/login" ? "Log In" : "Sign Up"}
        </RouterLink>
      </Box>
    </>
  )
}

export default AuthOptions
