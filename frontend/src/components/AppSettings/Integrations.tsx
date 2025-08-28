import {
  Brain,
  Cloud,
  Database,
  ExternalLink,
  Package,
  Plug,
  Settings,
} from "lucide-react"
import { useState } from "react"
import { SiRedis } from "react-icons/si"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: React.ElementType
  status: "coming_soon" | "available" | "connected"
  configUrl?: string
}

export const IntegrationsView = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const integrations: Integration[] = [
    {
      id: "gel",
      name: "Gel (EdgeDB)",
      description: "Managed database service for your applications.",
      category: "database",
      icon: Database,
      status: "coming_soon",
      configUrl: "#",
    },
    {
      id: "redis",
      name: "Redis",
      description: "In-memory data store for caching and real-time features.",
      category: "database",
      icon: SiRedis,
      status: "coming_soon",
      configUrl: "#",
    },
    {
      id: "neon",
      name: "Neon",
      description: "Serverless Postgres database for your applications.",
      category: "database",
      icon: Database,
      status: "coming_soon",
      configUrl: "#",
    },
  ]

  const categories = [
    { id: "all", name: "All Integrations", icon: Package },
    { id: "database", name: "Databases", icon: Database },
    { id: "storage", name: "Storage", icon: Cloud },
    { id: "ai", name: "AI/ML", icon: Brain },
  ]

  const filteredIntegrations =
    selectedCategory === "all"
      ? integrations
      : integrations.filter((i) => i.category === selectedCategory)

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            Connected
          </Badge>
        )
      case "available":
        return <Badge variant="outline">Available</Badge>
      case "coming_soon":
        return <Badge variant="secondary">Coming Soon</Badge>
    }
  }

  const getActionButton = (integration: Integration) => {
    switch (integration.status) {
      case "connected":
        return (
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-3.5 w-3.5" />
            Configure
          </Button>
        )
      case "available":
        return (
          <Button size="sm" className="gap-2">
            <Plug className="h-3.5 w-3.5" />
            Connect
          </Button>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Plug className="h-5 w-5" />
          <h3 className="font-medium">Browse Integrations</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="gap-2"
              >
                <Icon className="h-3.5 w-3.5" />
                {category.name}
              </Button>
            )
          })}
        </div>
      </div>

      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
        {filteredIntegrations.map((integration) => {
          const Icon = integration.icon
          return (
            <div key={integration.id} className="p-4 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon className="h-5 w-5 text-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{integration.name}</h4>
                      {getStatusBadge(integration.status)}
                    </div>
                  </div>
                </div>
                {getActionButton(integration)}
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {integration.description}
              </p>

              {integration.status === "connected" && integration.configUrl && (
                <div className="mt-3 pt-3 border-t">
                  <a
                    href={integration.configUrl}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    View configuration
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default IntegrationsView
