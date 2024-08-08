import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { AiFillEdit, AiFillSave } from "react-icons/ai"

interface EditableFieldProps {
  type: string
  value: string
  onSubmit: (newValue: string) => void
  canEdit: boolean
}

const EditableField = ({
  type,
  value,
  onSubmit,
  canEdit,
}: EditableFieldProps) => {
  const [editMode, setEditMode] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors, isDirty, isValid },
  } = useForm({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      [type]: value,
    },
  })

  const onCancel = () => {
    reset()
    setEditMode(false)
  }

  const onSubmitForm: SubmitHandler<{ [key: string]: string }> = async (
    data,
  ) => {
    onSubmit(data[type])

    setEditMode(false)
  }

  return (
    <Flex
      maxW="full"
      align="center"
      as="form"
      onSubmit={handleSubmit(onSubmitForm)}
    >
      {editMode ? (
        <>
          <FormControl id={type} isInvalid={!!errors[type]} w="250px">
            <Input
              id={type}
              {...register(type, { required: "This field is required" })}
              type={type}
              size="md"
              isInvalid={!!errors[type]}
            />
            {errors[type] && (
              <FormErrorMessage>{errors[type]?.message}</FormErrorMessage>
            )}
          </FormControl>
        </>
      ) : (
        <Text w="250px">{value}</Text>
      )}
      {canEdit && (
        <Flex gap={2} ml={4}>
          {editMode && (
            <Button onClick={onCancel} isDisabled={isSubmitting} size="sm">
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            leftIcon={<Icon as={editMode ? AiFillSave : AiFillEdit} />}
            size="sm"
            onClick={editMode ? undefined : () => setEditMode(true)}
            type={editMode ? "submit" : "button"}
            isLoading={editMode ? isSubmitting : false}
            isDisabled={editMode ? !isDirty || !isValid : false}
          >
            {editMode ? "Save" : "Edit"}
          </Button>
        </Flex>
      )}
    </Flex>
  )
}

export default EditableField
