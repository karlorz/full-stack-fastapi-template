import { Link as RouterLink, useMatchRoute } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { Item } from "./AppSidebar"

export function NavMain({ items }: { items: Item[] }) {
  const matchRoute = useMatchRoute()
  const { isMobile, setOpenMobile } = useSidebar()

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="uppercase font-normal text-xs tracking-wide text-zinc-700 dark:text-zinc-300">
        Menu
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = matchRoute({ to: item.to, params: item.params })

          return (
            <SidebarMenuItem key={item.title} className="px-3 py-1.5">
              <RouterLink
                to={item.to}
                params={item.params}
                onClick={handleMenuClick}
              >
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "flex gap-2 items-center w-full rounded-md px-2 py-2 transition-colors duration-200",
                    isActive
                      ? [
                          "bg-primary/15 text-primary font-medium",
                          "dark:bg-primary/25",
                          "hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/25",
                        ]
                      : ["hover:bg-muted dark:hover:bg-muted"],
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "transition-colors duration-200 h-5 w-5",
                        isActive ? "text-primary" : "text-inherit",
                      )}
                    />
                  )}
                  <span className="ml-1">{item.title}</span>
                </SidebarMenuButton>
              </RouterLink>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
