"use client"

import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowRight, RotateCcw, Clock, CheckCircle2, XCircle } from "lucide-react"

const assignments = [
  {
    id: "1",
    asset: "MacBook Pro 14\"",
    assetId: "MBP-2024-001",
    assignedTo: "John Smith",
    assignedBy: "Emily Davis",
    department: "Computer Science",
    assignedDate: "Jan 15, 2024",
    dueDate: "Jun 15, 2024",
    status: "Active",
  },
  {
    id: "2",
    asset: "Adobe Creative Cloud",
    assetId: "SW-ACC-2024-012",
    assignedTo: "Sarah Johnson",
    assignedBy: "Emily Davis",
    department: "Marketing",
    assignedDate: "Jan 10, 2024",
    dueDate: "Jan 10, 2025",
    status: "Active",
  },
  {
    id: "3",
    asset: "Dell XPS 15",
    assetId: "LPT-DELL-2024-015",
    assignedTo: "Mike Chen",
    assignedBy: "Emily Davis",
    department: "Engineering",
    assignedDate: "Jan 20, 2024",
    dueDate: "May 20, 2024",
    status: "Active",
  },
  {
    id: "4",
    asset: "Logitech Webcam",
    assetId: "ACC-WC-2023-045",
    assignedTo: "Lisa Anderson",
    assignedBy: "Robert Wilson",
    department: "Physics",
    assignedDate: "Oct 01, 2023",
    dueDate: "Feb 01, 2024",
    status: "Overdue",
  },
  {
    id: "5",
    asset: "Microsoft Surface Pro",
    assetId: "TAB-MS-2023-089",
    assignedTo: "James Brown",
    assignedBy: "Emily Davis",
    department: "Administration",
    assignedDate: "Dec 15, 2023",
    dueDate: "Dec 15, 2024",
    status: "Returned",
  },
]

const statusStyles = {
  Active: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/20", icon: CheckCircle2 },
  Overdue: { bg: "bg-destructive/10", text: "text-destructive", border: "border-destructive/20", icon: XCircle },
  Returned: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", icon: RotateCcw },
  Pending: { bg: "bg-amber-500/10", text: "text-amber-500", border: "border-amber-500/20", icon: Clock },
}

export default function AssignmentsPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Assignments"
        description="Track asset assignments and returns"
        action={{
          label: "New Assignment",
          onClick: () => console.log("New assignment"),
        }}
      />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Total Active</p>
            <p className="mt-1 text-2xl font-bold text-foreground">24</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-sm text-emerald-500">On Time</p>
            <p className="mt-1 text-2xl font-bold text-emerald-500">21</p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <p className="text-sm text-destructive">Overdue</p>
            <p className="mt-1 text-2xl font-bold text-destructive">3</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-sm text-muted-foreground">Returned This Month</p>
            <p className="mt-1 text-2xl font-bold text-foreground">8</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search assignments..." className="pl-9 bg-secondary" />
          </div>
        </div>

        {/* Assignments Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((assignment) => {
            const statusStyle = statusStyles[assignment.status as keyof typeof statusStyles]
            const StatusIcon = statusStyle.icon
            return (
              <div
                key={assignment.id}
                className="rounded-xl border border-border bg-card p-5 transition-colors hover:bg-card/80"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{assignment.asset}</h3>
                    <code className="text-xs text-muted-foreground">{assignment.assetId}</code>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
                      statusStyle.bg,
                      statusStyle.text,
                      statusStyle.border
                    )}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {assignment.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-medium text-primary">
                    {assignment.assignedTo.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{assignment.assignedTo}</p>
                    <p className="text-xs text-muted-foreground">{assignment.department}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{assignment.assignedDate}</span>
                  <ArrowRight className="h-3 w-3" />
                  <span className={assignment.status === "Overdue" ? "text-destructive" : ""}>
                    {assignment.dueDate}
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  {assignment.status === "Active" && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Process Return
                    </Button>
                  )}
                  {assignment.status === "Overdue" && (
                    <Button variant="destructive" size="sm" className="flex-1">
                      Send Reminder
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
