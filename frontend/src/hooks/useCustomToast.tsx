import { CheckCircleIcon, WarningIcon, WarningTwoIcon } from "@chakra-ui/icons"
import { useToast } from "@chakra-ui/react"
import { useCallback } from "react"
import CustomToast from "./CustomToast"

const useCustomToast = () => {
  const toast = useToast()

  const showToast = useCallback(
    (
      title: string,
      description: string,
      status: "success" | "error" | "warning",
    ) => {
      const statusColor = {
        success: {
          bg: "green.50",
          color: "success.base",
          icon: CheckCircleIcon,
        },
        error: {
          bg: "red.50",
          color: "error.base",
          icon: WarningTwoIcon,
        },
        warning: {
          bg: "yellow.50",
          color: "warning.base",
          icon: WarningIcon,
        },
      }

      toast({
        position: "top",
        render: () => (
          <CustomToast
            title={title}
            description={description}
            bg={statusColor[status].bg}
            color={statusColor[status].color}
            icon={statusColor[status].icon}
          />
        ),
      })
    },
    [toast],
  )

  return showToast
}

export default useCustomToast
