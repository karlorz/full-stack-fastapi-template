import { Eye, EyeCrossed } from "@/assets/icons.tsx"
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  useBoolean,
} from "@chakra-ui/react"
import type { RegisterOptions, UseFormRegister } from "react-hook-form"

interface PasswordFieldProps {
  password: string
  errors: any
  register: UseFormRegister<any>
  options?: RegisterOptions
  placeholder: string
  icon?: any
}

const PasswordField = ({
  password,
  errors,
  register,
  options,
  placeholder,
  icon,
}: PasswordFieldProps) => {
  const [show, setShow] = useBoolean()

  return (
    <FormControl id={password} isInvalid={!!errors[password]}>
      <FormLabel htmlFor={password} srOnly>
        Password
      </FormLabel>
      <InputGroup>
        {icon && (
          <InputLeftElement pointerEvents="none">
            <Icon as={icon} color="ui.dim" />
          </InputLeftElement>
        )}
        <Input
          {...register(password, options)}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          required
          variant="outline"
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
            {show ? <EyeCrossed /> : <Eye />}
          </Icon>
        </InputRightElement>
      </InputGroup>
      {errors[password] && (
        <FormErrorMessage>{errors[password].message}</FormErrorMessage>
      )}
    </FormControl>
  )
}

export default PasswordField
