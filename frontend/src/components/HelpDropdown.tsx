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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Resources
        </DropdownMenuLabel>

        <DropdownMenuItem asChild className="cursor-pointer">
          <a
            href="https://fastapicloud.com/docs/getting-started"
            target="_blank"
            rel="noopener noreferrer"
          >
            <BookOpen className="h-4 w-4" />
            <div>
              <div className="text-sm">Documentation</div>
              <div className="text-xs text-muted-foreground">
                Guides and tutorials
              </div>
            </div>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Community
        </DropdownMenuLabel>

        <DropdownMenuItem asChild className="cursor-pointer">
          <a
            href="https://join.slack.com/t/fastapicloud/shared_invite/zt-393v7lizn-w95~VtDGXJ0IsvtqLW~afQ"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FiSlack className="h-4 w-4" />
            <div>
              <div className="text-sm">Slack Workspace</div>
              <div className="text-xs text-muted-foreground">
                Chat with other users
              </div>
            </div>
            <ExternalLink className="h-3 w-3 ml-auto" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Support
        </DropdownMenuLabel>

        <DropdownMenuItem asChild className="cursor-pointer">
          <a href="mailto:support@fastapicloud.com">
            <LifeBuoy className="h-4 w-4" />
            <div>
              <div className="text-sm">Contact Support</div>
              <div className="text-xs text-muted-foreground">
                Get help from our team
              </div>
            </div>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
