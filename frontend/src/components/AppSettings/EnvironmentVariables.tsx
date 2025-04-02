import { AppsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Box, Flex, Grid, GridItem, IconButton, Input } from "@chakra-ui/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, History, PackageOpen, Trash } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { Tooltip } from "@/components/ui/tooltip"
import useToggle from "@/hooks/useToggle"
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
  const [show, toggleShow] = useToggle(false)
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
      <Field invalid={!!error?.name} errorText={error?.name?.message}>
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
      </Field>
      <Field invalid={!!error?.value} errorText={error?.value?.message}>
        <InputGroup
          w="100%"
          endElement={
            !disabled && (
              <IconButton
                size="xs"
                variant="ghost"
                color="inherit"
                onClick={() => toggleShow()}
                aria-label={show ? "Hide password" : "Show password"}
                _hover={{
                  cursor: "pointer",
                }}
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </IconButton>
            )
          }
        >
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
        </InputGroup>
      </Field>
      <Flex gap={2} align="center">
        {disabled ? null : (
          <Tooltip content={deleted ? "Restore" : "Mark for deletion"}>
            <IconButton
              variant="ghost"
              color="inherit"
              aria-label={deleted ? "Restore" : "Mark for deletion"}
              onClick={() => onDelete()}
              _hover={{
                cursor: "pointer",
              }}
            >
              {deleted ? <History /> : <Trash />}
            </IconButton>
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

  const { showErrorToast } = useCustomToast()

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
    onError: handleError.bind(showErrorToast),
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
            icon={PackageOpen}
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
          <Button variant="outline" type="button" onClick={handleAddNew}>
            Add Environment Variable
          </Button>
        </GridItem>
      ) : null}

      {shouldShowFooter ? (
        <GridItem colSpan={3} display="flex" justifyContent="flex-end" gap={2}>
          {isEditing ? (
            <>
              <Button
                variant="subtle"
                colorPalette="gray"
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  reset()
                }}
              >
                Cancel
              </Button>
              <Button
                variant="solid"
                type="submit"
                disabled={isPending}
                loading={isPending}
              >
                Save
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditing(true)}
              >
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
