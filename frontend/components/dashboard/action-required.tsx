import { Button } from "@/components/ui/button"

interface ActionItem {
  id: string
  title: string
  description: string
  timestamp: string
}

interface ActionRequiredProps {
  items: ActionItem[]
  onReview: (id: string) => void
}

export function ActionRequired({ items, onReview }: ActionRequiredProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="h-2 w-2 rounded-full bg-destructive" />
          Action Required
        </h3>
        <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          View All →
        </button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Assets awaiting manager approval</p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
          >
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <p className="text-xs text-muted-foreground">@ {item.timestamp}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReview(item.id)}
              className="shrink-0"
            >
              Review
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
