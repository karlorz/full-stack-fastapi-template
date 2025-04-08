import { TeamsService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import { fetchTeamBySlug, handleError } from "@/utils"
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormMessage } from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface TransferTeamForm {
  userId: string
  team: string
}

interface AdminUser {
  user: {
    email: string
    id: string
  }
}

interface TransferTeamProps {
  adminUsers: AdminUser[]
  team: string
}

const TransferTeam = ({ adminUsers, team: teamSlug }: TransferTeamProps) => {
  const { data: team } = useSuspenseQuery({
    queryKey: ["team", teamSlug],
    queryFn: () => fetchTeamBySlug(teamSlug),
  })
  const queryClient = useQueryClient()

  const form = useForm<TransferTeamForm>({
    defaultValues: {
      userId: "",
    },
  })

  const { showSuccessToast, showErrorToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      return TeamsService.transferTeam({
        teamId: team.id,
        requestBody: {
          user_id: userId,
        },
      })
    },
    onSuccess: () => {
      showSuccessToast("The team was transferred successfully")
    },
    onError: handleError.bind(showErrorToast),
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit = (values: TransferTeamForm) => mutation.mutate(values.userId)

  return (
    <div className="pt-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-1/2 space-y-4"
        >
          <FormField
            control={form.control}
            name="userId"
            rules={{ required: "Please select a user" }}
            render={({ field }) => (
              <FormControl>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <SelectTrigger
                        data-testid="user-select"
                        className="w-full"
                      >
                        <SelectValue placeholder="Select User" />
                      </SelectTrigger>
                      <SelectContent>
                        {adminUsers.length > 0 ? (
                          adminUsers.map((admin) => (
                            <SelectItem
                              key={admin.user.id}
                              value={admin.user.id}
                            >
                              {admin.user.email}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-option" disabled>
                            No options available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="w-full md:w-auto"
                  >
                    {mutation.isPending ? "Transferring..." : "Transfer Team"}
                  </Button>
                  <FormMessage />
                </div>
              </FormControl>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

export default TransferTeam
