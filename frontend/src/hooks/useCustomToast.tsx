"use client"

import { toaster } from "@/components/ui/toaster"

const useCustomToast = () => {
  const showSuccessToast = (description: string) => {
    toaster.create({
      title: "Success!",
      description,
      type: "success",
      meta: {
        bg: "green.50",
        color: "success.base",
        closable: true,
      },
    })
  }

  const showErrorToast = (description: string) => {
    toaster.create({
      title: "Something went wrong!",
      description,
      type: "error",
      meta: {
        bg: "red.50",
        color: "error.base",
        closable: true,
      },
    })
  }

  return { showSuccessToast, showErrorToast }
}

export default useCustomToast
