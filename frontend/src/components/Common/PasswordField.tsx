import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons"
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  useBoolean,
} from "@chakra-ui/react"

interface PasswordFieldProps {
  password: string
  errors: any
  register: any
  options?: any
  placeholder: string
}

const PasswordField = ({
  password,
  errors,
  register,
  options,
  placeholder,
}: PasswordFieldProps) => {
  const [show, setShow] = useBoolean()

  return (
    <FormControl id={password} isInvalid={!!errors.current_password} my={4}>
      <FormLabel htmlFor={password} srOnly>
        Password
      </FormLabel>
      <InputGroup>
        <Input
          {...register(password, options)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          required
        />
        <InputRightElement
          color="ui.dim"
          _hover={{
            cursor: "pointer",
          }}
        >
          <Icon
            onClick={setShow.toggle}
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <ViewOffIcon /> : <ViewIcon />}
          </Icon>
        </InputRightElement>
      </InputGroup>
      {errors.password && (
        <FormErrorMessage>{errors.password.message}</FormErrorMessage>
      )}
    </FormControl>
  )
}

export default PasswordField
