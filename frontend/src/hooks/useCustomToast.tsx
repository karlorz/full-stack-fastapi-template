"use client"

import { toaster } from "@/components/ui/toaster"
import { useCallback } from "react"

const useCustomToast = () => {
  const showToast = useCallback(
    (
      title: string,
      description: string,
      status: "success" | "error" | "warning",
    ) => {
      const statusConfig = {
        success: {
          bg: "green.50",
          color: "success.base",
        },
        error: {
          bg: "red.50",
          color: "error.base",
        },
        warning: {
          bg: "yellow.50",
          color: "warning.base",
        },
      }

      toaster.create({
        title,
        description,
        type: status,
        meta: {
          bg: statusConfig[status].bg,
          color: statusConfig[status].color,
          closable: true,
        },
      })
    },
    [],
  )

  return showToast
}

export default useCustomToast
