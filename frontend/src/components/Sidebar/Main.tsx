import { Link as RouterLink, useMatchRoute } from "@tanstack/react-router"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import type { Item } from "./AppSidebar"

export function NavMain({ items }: { items: Item[] }) {
  const matchRoute = useMatchRoute()

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = matchRoute({ to: item.to, params: item.params })

          return (
            <SidebarMenuItem key={item.title}>
              <RouterLink to={item.to} params={item.params}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={cn(
                    "transition-colors duration-200",
                    isActive
                      ? [
                          "bg-primary/15 text-primary font-medium",
                          "dark:bg-primary/25",
                          "hover:bg-primary/15 hover:text-primary dark:hover:bg-primary/25",
                        ]
                      : ["hover:bg-gray-100 dark:hover:bg-gray-800"],
                  )}
                >
                  {item.icon && (
                    <item.icon
                      className={cn(
                        "transition-colors duration-200",
                        isActive ? "text-primary" : "text-inherit",
                      )}
                    />
                  )}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </RouterLink>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
