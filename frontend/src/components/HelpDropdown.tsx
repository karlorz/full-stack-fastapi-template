import { BookOpen, ExternalLink, HelpCircle, LifeBuoy } from "lucide-react"
import { FiSlack } from "react-icons/fi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function HelpDropdown() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <HelpCircle className="h-4 w-4" />
          <span>Help</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              Need help with your project?
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              Explore our resources for assistance and support.
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href="https://fastapicloud.com/docs/getting-started"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">Documentation</span>
              <span className="text-xs text-muted-foreground">
                Read our guides and tutorials
              </span>
            </div>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="font-normal">
          <p className="text-xs text-muted-foreground">
            Reach out to the community
          </p>
        </DropdownMenuLabel>

        <DropdownMenuItem asChild>
          <a
            href="https://join.slack.com/t/fastapicloud/shared_invite/zt-393v7lizn-w95~VtDGXJ0IsvtqLW~afQ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 cursor-pointer"
          >
            <FiSlack className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">Join Slack Workspace</span>
              <span className="text-xs text-muted-foreground">
                Connect and chat with other users
              </span>
            </div>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href="mailto:support@fastapicloud.com"
            className="flex items-center gap-3 cursor-pointer"
          >
            <LifeBuoy className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col gap-0.5">
              <span className="text-sm">Contact Support</span>
              <span className="text-xs text-muted-foreground">
                Get help from our support team
              </span>
            </div>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
