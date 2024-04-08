import { Icon, Input, InputGroup, InputRightElement } from "@chakra-ui/react"
import { FaSearch } from "react-icons/fa"

const Searchbar = () => {
  return (
    <>
      <InputGroup mx={8}>
        <Input
          variant="filled"
          type="text"
          placeholder="Search"
          fontSize={{ base: "sm", md: "inherit" }}
          borderRadius="8px"
        />
        <InputRightElement pointerEvents="none">
          <Icon as={FaSearch} color="ui.dim" />
        </InputRightElement>
      </InputGroup>
    </>
  )
}

export default Searchbar
