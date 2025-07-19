import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { usePostHog } from "posthog-js/react"
import { FastAPIAuth } from "@/lib/auth"
import { handleError } from "@/utils"
import {
  type ApiError,
  type Body_login_login_access_token as LoginFormData,
  LoginService,
  type UserMePublic,
  type UserRegister,
  UsersService,
} from "../client"
import useCustomToast from "./useCustomToast"

const fastapiAuth = new FastAPIAuth()

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
    onError: handleError.bind(showErrorToast),
    onSettled: () => queryClient.invalidateQueries(),
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
      posthog.stopSessionRecording()
    } catch (_error) {
      // do nothing
    }

    const search = redirect ? { redirect } : undefined
    navigate({ to: "/login", search })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    loginWithProvider: fastapiAuth.socialLogin.bind(fastapiAuth),
    linkWithProvider: fastapiAuth.linkWithProvider.bind(fastapiAuth),
    handleOAuthCallback: fastapiAuth.handleOAuthCallback.bind(fastapiAuth),
  }
}

export { isLoggedIn, useCurrentUser }
export default useAuth
