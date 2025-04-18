import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { usePostHog } from "posthog-js/react"
import {
  type ApiError,
  type Body_login_login_access_token as LoginFormData,
  LoginService,
  type UserMePublic,
  type UserRegister,
  UsersService,
} from "../client"
import useCustomToast from "./useCustomToast"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useCurrentUser = () => {
  const { data } = useSuspenseQuery<UserMePublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: () => (isLoggedIn() ? UsersService.readUserMe() : null),
  })

  return data
}

const useAuth = () => {
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()
  const navigate = useNavigate()

  const posthog = usePostHog()

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      showErrorToast(errDetail)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const login = async (data: {
    redirect?: string
    formData: LoginFormData
  }) => {
    const response = await LoginService.loginAccessToken({
      formData: data.formData,
    })
    queryClient.setQueryData(["currentUser"], response.user)
    localStorage.setItem("access_token", response.access_token)

    try {
      posthog.identify(response.user.id, {
        email: response.user.email,
        name: response.user.full_name,
      })
    } catch (error) {
      // do nothing
    }

    return data.redirect
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (redirect) => {
      navigate({ to: redirect || "/" })
    },
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      showErrorToast(errDetail)
    },
  })

  const logout = (redirect?: string) => {
    queryClient.removeQueries()

    localStorage.removeItem("current_team")
    localStorage.removeItem("access_token")

    try {
      posthog.reset(true)
    } catch (error) {
      // do nothing
    }

    const search = redirect ? { redirect } : undefined
    navigate({ to: "/login", search })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
  }
}

export { isLoggedIn, useCurrentUser }
export default useAuth
