import { cn } from "@/lib/utils"

interface Activity {
  id: string
  type: "assigned" | "returned" | "created" | "updated" | "maintenance"
  description: string
  user: string
  timestamp: string
}

interface ActivityListProps {
  activities: Activity[]
  title: string
  showViewAll?: boolean
}

const typeStyles = {
  assigned: "bg-primary/20 text-primary",
  returned: "bg-emerald-500/20 text-emerald-500",
  created: "bg-blue-500/20 text-blue-500",
  updated: "bg-amber-500/20 text-amber-500",
  maintenance: "bg-orange-500/20 text-orange-500",
}

const typeLabels = {
  assigned: "ASSIGNED",
  returned: "RETURNED",
  created: "CREATED",
  updated: "UPDATED",
  maintenance: "MAINTENANCE",
}

export function ActivityList({ activities, title, showViewAll }: ActivityListProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="text-amber-400">*</span>
          {title}
        </h3>
        {showViewAll && (
          <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            View All →
          </button>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Latest system events</p>

      <div className="mt-4 space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start justify-between rounded-lg bg-secondary/50 p-3"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                    typeStyles[activity.type]
                  )}
                >
                  {typeLabels[activity.type]}
                </span>
              </div>
              <p className="text-sm text-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.user}</p>
            </div>
            <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
