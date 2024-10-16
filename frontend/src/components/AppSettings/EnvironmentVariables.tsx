import { AppsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Tooltip,
  useBoolean,
} from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Fragment, useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"

import { EmptyBox, Eye, EyeCrossed, Restore, Trash } from "@/assets/icons"
import { z } from "zod"
import EmptyState from "../Common/EmptyState"

const EnvironmentVariableFields = ({
  item,
  index,
  edited,
  deleted,
  register,
  error,
  onDelete,
  disabled,
}: {
  item: any
  index: number
  edited: boolean
  deleted: boolean
  register: any
  error?: { name?: { message?: string }; value?: { message?: string } }
  onDelete: () => void
  disabled: boolean
}) => {
  const [show, setShow] = useBoolean()
  let [color, backgroundColor] = ["", ""]

  if (deleted) {
    color = "red.500"
    backgroundColor = "red.100"
  } else if (edited && !item.new) {
    backgroundColor = "yellow.50"
  }

  return (
    <Box
      key={item.id}
      as="li"
      display="contents"
      data-testid="environment-variable"
    >
      <FormControl isInvalid={!!error?.name}>
        <FormLabel srOnly htmlFor={`${item.id}-name`}>
          Name
        </FormLabel>
        <Input
          {...register(`environmentVariables.${index}.name`)}
          id={`${item.id}-name`}
          textDecoration={deleted ? "line-through" : ""}
          backgroundColor={backgroundColor}
          color={color}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          placeholder="MY_COOL_ENV_VAR"
          data-1p-ignore
        />
        {error?.name ? (
          <FormErrorMessage>{error?.name.message}</FormErrorMessage>
        ) : null}
      </FormControl>
      <FormControl isInvalid={!!error?.value}>
        <FormLabel srOnly htmlFor={`${item.id}-value`}>
          Value
        </FormLabel>
        <InputGroup>
          <Input
            {...register(`environmentVariables.${index}.value`)}
            id={`${item.id}-value`}
            textDecoration={deleted ? "line-through" : ""}
            backgroundColor={backgroundColor}
            color={color}
            disabled={disabled}
            type={show ? "text" : "password"}
            autoComplete="off"
            spellCheck="false"
            placeholder="My secret value"
            data-1p-ignore
          />
          {!disabled && (
            <InputRightElement
              color={deleted ? "white" : "ui.dim"}
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
          )}
        </InputGroup>
        {error?.value ? (
          <FormErrorMessage>{error?.value.message}</FormErrorMessage>
        ) : null}
      </FormControl>
      <Flex gap={2} align="center">
        {disabled ? null : (
          <Tooltip label={deleted ? "Restore" : "Mark for deletion"}>
            <IconButton
              aria-label={deleted ? "Restore" : "Mark for deletion"}
              onClick={() => onDelete()}
              icon={deleted ? <Restore /> : <Trash />}
            />
          </Tooltip>
        )}
      </Flex>
    </Box>
  )
}

const formSchema = z.object({
  environmentVariables: z
    .array(
      z.object({
        name: z
          .string({
            required_error: "Environment variable name is required",
            invalid_type_error: "Environment variable name must be a string",
          })
          .regex(
            /^[a-zA-Z][a-zA-Z0-9_]*$/,
            "Environment variable name must start with a letter and contain only letters, numbers, or underscores",
          )
          .min(1, "Environment variable name must not be empty")
          .max(255, "Environment variable name must not exceed 255 characters"),
        value: z
          .string()
          .min(1, "Environment variable value must not be empty"),
        deleted: z.boolean().optional(),
        new: z.boolean().optional(),
      }),
    )
    .superRefine((items, ctx) => {
      const seen = new Map<string, { count: number; indexes: number[] }>()

      items.forEach((value, index) => {
        if (seen.has(value.name)) {
          seen.get(value.name)!.count++
          seen.get(value.name)!.indexes.push(index)
        } else {
          seen.set(value.name, { count: 1, indexes: [index] })
        }
      })

      const indexesOfDuplicates = Array.from(seen.values())
        .filter((value) => value.count > 1)
        .flatMap((value) => value.indexes)

      for (const index of indexesOfDuplicates) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Environment variable name must be unique",
          path: [index, "name"],
        })
      }
    }),
})

type Schema = z.infer<typeof formSchema>

const EnvironmentVariables = ({
  appId,
  environmentVariables,
}: {
  appId: string
  environmentVariables: Array<{
    name: string
    value: string
  }>
}) => {
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState,
    setValue,
    getValues,
  } = useForm<Schema>({
    defaultValues: { environmentVariables },
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "environmentVariables",
  })

  const [isEditing, setIsEditing] = useState(false)

  const initialEnvironmentVariablesCount = environmentVariables.length
  const hasEnvironmentVariables =
    watch("environmentVariables").length > 0 ||
    initialEnvironmentVariablesCount > 0

  const shouldShowAddEnvironmentVariable =
    isEditing || environmentVariables.length === 0
  const shouldShowFooter = isEditing || hasEnvironmentVariables

  const showToast = useCustomToast()

  useEffect(() => {
    reset({ environmentVariables })
  }, [environmentVariables, reset])

  const handleDelete = (index: number) => {
    const item = getValues(`environmentVariables.${index}`)

    if (!item.deleted) {
      // instead of marking new items as deleted, we just remove them
      if (item.new) {
        remove(index)
      } else {
        setValue(`environmentVariables.${index}.deleted`, true, {
          shouldDirty: true,
        })
      }
    } else {
      setValue(`environmentVariables.${index}.deleted`, false, {
        shouldDirty: true,
      })
    }
  }

  const handleAddNew = () => {
    setIsEditing(true)
    append({ name: "", value: "", new: true })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: { [name: string]: string | null }) => {
      return AppsService.updateEnvironmentVariables({
        appId,
        requestBody: data,
      })
    },
    onSuccess: (response) => {
      setIsEditing(false)

      queryClient.setQueryData(
        ["apps", appId, "environmentVariables"],
        response,
      )
    },
    onError: handleError.bind(showToast),
  })

  const onSubmit = (data: Schema) => {
    const { dirtyFields } = formState

    const dataToSend: { [name: string]: string | null } = {}

    data.environmentVariables.forEach((item, index) => {
      if (item.new) {
        if (!item.deleted) {
          dataToSend[item.name] = item.value
        }
        return
      }

      const field = dirtyFields.environmentVariables?.[index]

      if (!field) {
        return
      }

      if (item.deleted) {
        dataToSend[item.name] = null
      } else {
        // if we have changed the name for an existing variable, then we want to remove
        // the existing variable, and create a new one
        if (field.name) {
          const existingName = environmentVariables[index].name

          dataToSend[existingName] = null
        }

        dataToSend[item.name] = item.value
      }
    })

    mutate(dataToSend)
  }

  return (
    <Grid
      mt="4"
      templateColumns="1fr 1fr 80px"
      gap={4}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
    >
      {hasEnvironmentVariables ? (
        <>
          <Box textTransform="capitalize">Name</Box>
          <Box textTransform="capitalize">Value</Box>
          <Box textTransform="capitalize" />
        </>
      ) : (
        <GridItem colSpan={4} display="flex" justifyContent="center">
          <EmptyState
            title="You don't have any environment variables yet"
            icon={EmptyBox}
          />
        </GridItem>
      )}

      <Box as="ul" display="contents" data-testid="environment-variables-list">
        {fields.map((item, index) => (
          <Fragment key={item.id}>
            {index > 0 && index === initialEnvironmentVariablesCount ? (
              <Box as="li" display="contents">
                <GridItem colSpan={2} textAlign="center">
                  New environment variables
                </GridItem>
                <Box />
              </Box>
            ) : null}
            <EnvironmentVariableFields
              index={index}
              item={item}
              edited={Object.values(
                formState.dirtyFields.environmentVariables?.[index] ?? [],
              ).some((x) => x)}
              register={register}
              error={formState.errors.environmentVariables?.[index]}
              deleted={watch(`environmentVariables.${index}.deleted`) || false}
              onDelete={() => handleDelete(index)}
              disabled={!isEditing}
            />
          </Fragment>
        ))}
      </Box>

      {shouldShowAddEnvironmentVariable ? (
        <GridItem colSpan={3}>
          <Button type="button" onClick={handleAddNew}>
            Add Environment Variable
          </Button>
        </GridItem>
      ) : null}

      {shouldShowFooter ? (
        <GridItem colSpan={3} display="flex" justifyContent="flex-end" gap={2}>
          {isEditing ? (
            <>
              <Button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            </>
          )}
        </GridItem>
      ) : null}
    </Grid>
  )
}

export default EnvironmentVariables
