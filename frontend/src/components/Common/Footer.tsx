import { Comment, Document, Help } from "@/assets/icons.tsx"
import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Input,
  Link,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Text,
  Textarea,
} from "@chakra-ui/react"

const Footer = () => {
  return (
    // TODO: Add links to help and docs once available
    <Box as="footer" w="100%" p={4}>
      <Flex justifyContent="flex-end" alignItems="center">
        <Popover>
          <PopoverTrigger>
            <Link mx={2} display="flex" alignItems="center" cursor="pointer">
              <Comment />
              <Box as="span" ml={1}>
                Feedback
              </Box>
            </Link>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="semibold">Feedback</PopoverHeader>
            <PopoverBody>
              <Text my={3}>
                Please let us know your thoughts and suggestions to help us
                improve:
              </Text>
              <Input placeholder="Your email" mb={3} />
              <Textarea placeholder="Your comments" mb={3} />
            </PopoverBody>
            <PopoverFooter>
              <Flex justify="flex-end">
                <ButtonGroup size="sm">
                  <Button variant="tertiary">Cancel</Button>
                  <Button variant="secondary">Submit</Button>
                </ButtonGroup>
              </Flex>
            </PopoverFooter>
          </PopoverContent>
        </Popover>
        <Link mx={2} display="flex" alignItems="center">
          <Help />
          <Box as="span" ml={1}>
            Help
          </Box>
        </Link>
        <Link mx={2} display="flex" alignItems="center">
          <Document />
          <Box as="span" ml={1}>
            Docs
          </Box>
        </Link>
      </Flex>
    </Box>
  )
}

export default Footer
