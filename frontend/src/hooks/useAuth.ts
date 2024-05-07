import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AxiosError } from "axios"
import { useState } from "react"

import {
  type Body_login_login_access_token as AccessToken,
  type ApiError,
  LoginService,
  type UserPublic,
  type UserRegister,
  UsersService,
} from "../client"
import useCustomToast from "./useCustomToast"

const isLoggedIn = () => {
  return localStorage.getItem("access_token") !== null
}

const useCurrentUser = () => {
  const { data } = useSuspenseQuery<UserPublic | null, Error>({
    queryKey: ["currentUser"],
    queryFn: () => (isLoggedIn() ? UsersService.readUserMe() : null),
  })

  return data
}

const useAuth = () => {
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const showToast = useCustomToast()
  const navigate = useNavigate()

  const signUpMutation = useMutation({
    mutationFn: (data: UserRegister) =>
      UsersService.registerUser({ requestBody: data }),

    onSuccess: () => {
      showToast("Success!", "User registered successfully.", "success")
      navigate({ to: "/" })
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

  const login = async (data: AccessToken) => {
    const response = await LoginService.loginAccessToken({
      formData: data,
    })
    localStorage.setItem("access_token", response.access_token)
  }

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      navigate({ to: "/" })
    },
    onError: (err: ApiError) => {
      const errDetail = (err.body as any)?.detail
      setError(errDetail)
    },
  })

  const logout = () => {
    localStorage.removeItem("access_token")
    queryClient.invalidateQueries()
    navigate({ to: "/login" })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    error,
    resetError: () => setError(null),
  }
}

export { isLoggedIn, useCurrentUser }
export default useAuth
