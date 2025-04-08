import { Link, type ToOptions, linkOptions } from "@tanstack/react-router"

import type { TeamsPublic } from "@/client"
import { Home, LayoutGrid, type LucideIcon, Settings } from "lucide-react"
import TeamSelector from "./TeamSelector"

type Item = {
  icon: LucideIcon
  title: string
} & ToOptions

const getSidebarItems = ({ teamSlug }: { teamSlug: string }): Array<Item> => {
  return [
    {
      icon: Home,
      title: "Dashboard",
      ...linkOptions({
        to: "/$teamSlug/",
        params: { teamSlug },
      }),
    },
    {
      icon: LayoutGrid,
      title: "Apps",
      ...linkOptions({
        to: "/$teamSlug/apps",
        params: { teamSlug },
      }),
    },
    {
      icon: Settings,
      title: "Team Settings",
      ...linkOptions({
        to: "/$teamSlug/settings",
        params: { teamSlug },
      }),
    },
  ]
}

interface SidebarItemsProps {
  onClose?: () => void
  teams: TeamsPublic
  currentTeamSlug: string
}

const SidebarItems = ({
  onClose,
  teams,
  currentTeamSlug,
}: SidebarItemsProps) => {
  const items = getSidebarItems({ teamSlug: currentTeamSlug })

  const listItems = items.map(
    ({ icon: IconComponent, title, to, params }, index) => (
      <Link
        to={to}
        params={params}
        onClick={onClose}
        key={index}
        className="flex items-center gap-4 px-4 py-2 text-sm hover:bg-accent rounded-md"
      >
        <IconComponent className="h-4 w-4" />
        <span>{title}</span>
      </Link>
    ),
  )

  return (
    <div className="space-y-4">
      <TeamSelector teams={teams} currentTeamSlug={currentTeamSlug} />
      <div className="px-4 py-2">
        <h3 className="text-xs font-semibold text-foreground">Menu</h3>
      </div>
      <nav className="space-y-1">{listItems}</nav>
    </div>
  )
}

export default SidebarItems
