import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Eye, EyeOff, History, Trash } from "lucide-react"
import { Fragment, useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"

import { AppsService } from "@/client"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import useCustomToast from "@/hooks/useCustomToast"
import useToggle from "@/hooks/useToggle"
import { cn } from "@/lib/utils"
import { handleError } from "@/utils"
import EmptyState from "../Common/EmptyState"

const EnvironmentVariableFields = ({
  item,
  index,
  edited,
  deleted,
  form,
  onDelete,
  disabled,
}: {
  item: any
  index: number
  edited: boolean
  deleted: boolean
  form: ReturnType<typeof useForm<Schema>>
  onDelete: () => void
  disabled: boolean
}) => {
  const [show, toggleShow] = useToggle(false)

  return (
    <div key={item.id} className="contents" data-testid="environment-variable">
      <FormField
        control={form.control}
        name={`environmentVariables.${index}.name`}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                {...field}
                id={`${item.id}-name`}
                className={cn(
                  deleted && "line-through text-destructive",
                  edited && !item.new && "bg-yellow-50",
                  "w-full",
                )}
                disabled={disabled}
                autoComplete="off"
                spellCheck="false"
                placeholder="MY_COOL_ENV_VAR"
                data-1p-ignore
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name={`environmentVariables.${index}.value`}
        render={({ field }) => (
          <FormItem className="flex flex-col min-h-[60px]">
            <FormControl>
              <div className="relative w-full">
                <Input
                  {...field}
                  id={`${item.id}-value`}
                  className={cn(
                    deleted && "line-through text-destructive",
                    edited && !item.new && "bg-yellow-50",
                    "w-full pr-10",
                  )}
                  disabled={disabled}
                  type={show ? "text" : "password"}
                  autoComplete="off"
                  spellCheck="false"
                  placeholder="My secret value"
                  data-1p-ignore
                />
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => toggleShow()}
                  >
                    {show ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex min-h-[36px]">
        {!disabled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={deleted ? "Restore" : "Mark for deletion"}
                variant="ghost"
                size="icon"
                type="button"
                onClick={onDelete}
              >
                {deleted ? (
                  <History className="h-4 w-4" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {deleted ? "Restore" : "Mark for deletion"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
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

  const form = useForm<Schema>({
    defaultValues: { environmentVariables },
    resolver: zodResolver(formSchema),
    mode: "onBlur",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "environmentVariables",
  })

  const [isEditing, setIsEditing] = useState(false)

  const initialEnvironmentVariablesCount = environmentVariables.length
  const hasEnvironmentVariables =
    form.watch("environmentVariables").length > 0 ||
    initialEnvironmentVariablesCount > 0

  const shouldShowAddEnvironmentVariable =
    isEditing || (environmentVariables.length === 0 && hasEnvironmentVariables)
  const shouldShowFooter = isEditing || hasEnvironmentVariables

  const { showErrorToast } = useCustomToast()

  useEffect(() => {
    form.reset({ environmentVariables })
  }, [environmentVariables, form.reset])

  const handleDelete = (index: number) => {
    const item = form.getValues(`environmentVariables.${index}`)

    if (!item.deleted) {
      // instead of marking new items as deleted, we just remove them
      if (item.new) {
        remove(index)
      } else {
        form.setValue(`environmentVariables.${index}.deleted`, true, {
          shouldDirty: true,
        })
      }
    } else {
      form.setValue(`environmentVariables.${index}.deleted`, false, {
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
    const { dirtyFields } = form.formState

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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
        <div className="grid grid-cols-[1fr_1fr_80px] gap-4">
          {hasEnvironmentVariables ? (
            <>
              <div className="capitalize">Name</div>
              <div className="capitalize">Value</div>
              <div className="capitalize" />
            </>
          ) : (
            <EmptyState
              testId="empty-state"
              title="No environment variables yet"
              description="Add environment variables to configure your application."
              buttonText="Add Environment Variable"
              onButtonClick={handleAddNew}
            />
          )}

          <div className="contents" data-testid="environment-variables-list">
            {fields.map((item, index) => (
              <Fragment key={item.id}>
                {index > 0 && index === initialEnvironmentVariablesCount && (
                  <div className="contents">
                    <div className="col-span-2 text-center">
                      New environment variables
                    </div>
                    <div />
                  </div>
                )}
                <EnvironmentVariableFields
                  index={index}
                  item={item}
                  edited={Object.values(
                    form.formState.dirtyFields.environmentVariables?.[index] ??
                      [],
                  ).some((x) => x)}
                  form={form}
                  deleted={
                    form.watch(`environmentVariables.${index}.deleted`) || false
                  }
                  onDelete={() => handleDelete(index)}
                  disabled={!isEditing}
                />
              </Fragment>
            ))}
          </div>

          {shouldShowAddEnvironmentVariable && (
            <div className="col-span-3">
              <Button variant="outline" type="button" onClick={handleAddNew}>
                Add Environment Variable
              </Button>
            </div>
          )}

          {shouldShowFooter && (
            <div className="col-span-3 flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setIsEditing(false)
                      form.reset()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className={isPending ? "opacity-50 cursor-not-allowed" : ""}
                  >
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>
          )}
        </div>
      </form>
    </Form>
  )
}

export default EnvironmentVariables
