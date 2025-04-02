import {
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverRoot,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Box,
  Button,
  Flex,
  Group,
  Input,
  Link,
  Text,
  Textarea,
} from "@chakra-ui/react"

import { CircleHelp, FileText, MessageSquareText } from "lucide-react"

const Footer = () => {
  return (
    // TODO: Add links to help and docs once available
    <Box as="footer" w="100%" p={4}>
      <Flex justifyContent="flex-end" alignItems="center">
        <PopoverRoot>
          <PopoverTrigger asChild>
            <Link mx={2} display="flex" alignItems="center" cursor="pointer">
              <MessageSquareText size={16} />
              <Box as="span">Feedback</Box>
            </Link>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverArrow />
            <PopoverBody>
              <PopoverTitle fontWeight="semibold">Feedback</PopoverTitle>
              <Text my={3}>
                Please let us know your thoughts and suggestions to help us
                improve:
              </Text>
              <Input placeholder="Your email" mb={3} />
              <Textarea placeholder="Your comments" mb={3} />
            </PopoverBody>
            <PopoverFooter>
              <Flex justify="flex-end">
                <Group>
                  <Button variant="subtle" colorPalette="gray">
                    Cancel
                  </Button>
                  <Button variant="solid">Submit</Button>
                </Group>
              </Flex>
            </PopoverFooter>
          </PopoverContent>
        </PopoverRoot>
        <Link mx={2} display="flex" alignItems="center">
          <CircleHelp size={16} />
          <Box as="span">Help</Box>
        </Link>
        <Link mx={2} display="flex" alignItems="center">
          <FileText size={16} />
          <Box as="span">Docs</Box>
        </Link>
      </Flex>
    </Box>
  )
}

export default Footer
