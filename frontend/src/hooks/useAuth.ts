import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { useState } from "react"

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
  const [emailSent, setEmailSent] = useState(false)
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),

    onSuccess: () => {
      setEmailSent(true)
    },
    onError: (err: ApiError) => {
      let errDetail = (err.body as any)?.detail

      if (err instanceof AxiosError) {
        errDetail = err.message
      }

      showToast("Something went wrong.", `${errDetail}`, "error")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
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

      showToast("Something went wrong.", `${errDetail}`, "error")
    },
  })

  const logout = (redirect?: string) => {
    localStorage.removeItem("access_token")
    queryClient.invalidateQueries()
    const search = redirect ? { redirect } : undefined
    navigate({ to: "/login", search })
  }

  return {
    emailSent,
    setEmailSent,
    signUpMutation,
    loginMutation,
    logout,
  }
}

export { isLoggedIn, useCurrentUser }
export default useAuth
