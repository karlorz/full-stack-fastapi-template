import { Editable, IconButton } from "@chakra-ui/react"
import { type RegisterOptions, useForm } from "react-hook-form"
import { LuCheck, LuPencilLine, LuX } from "react-icons/lu"

import { Field } from "@/components/ui/field"

interface EditableFieldProps {
  type: string
  value: string
  onSubmit: (newValue: string) => void
  rules?: RegisterOptions
}

const EditableField = ({
  type,
  value,
  onSubmit,
  rules,
}: EditableFieldProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "all",
    criteriaMode: "all",
    defaultValues: {
      [type]: value,
    },
  })

  return (
    <Editable.Root
      w={{ base: "100%", md: "50%" }}
      maxW="300px"
      defaultValue={value}
      submitMode="none"
      onValueCommit={(details) => handleSubmit(() => onSubmit(details.value))()}
    >
      <>
        <Editable.Preview
          style={{
            display: "inline-block",
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        />
        <Field
          invalid={!!errors[type]}
          errorText={errors[type]?.message}
          style={{ flexGrow: 1 }}
        >
          <Editable.Input {...register(type, rules)} type={type} />
        </Field>
        <Editable.Control>
          <Editable.EditTrigger asChild>
            <IconButton variant="ghost" color="inherit" size="xs">
              <LuPencilLine />
            </IconButton>
          </Editable.EditTrigger>
          <Editable.CancelTrigger asChild>
            <IconButton variant="outline" color="inherit" size="xs">
              <LuX />
            </IconButton>
          </Editable.CancelTrigger>
          <Editable.SubmitTrigger asChild>
            <IconButton variant="outline" color="inherit" size="xs">
              <LuCheck />
            </IconButton>
          </Editable.SubmitTrigger>
        </Editable.Control>
      </>
    </Editable.Root>
  )
}

export default EditableField
