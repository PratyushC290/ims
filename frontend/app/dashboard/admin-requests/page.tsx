"use client"

import { Header } from "@/components/layout/header"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, Mail } from "lucide-react"

const pendingRequests = [
  {
    id: "1",
    name: "Alex Thompson",
    email: "a.thompson@university.edu",
    department: "Computer Science",
    requestDate: "Jan 24, 2024",
    reason: "Need admin access to manage department equipment inventory and track software licenses.",
  },
  {
    id: "2",
    name: "Maria Garcia",
    email: "m.garcia@university.edu",
    department: "Engineering",
    requestDate: "Jan 23, 2024",
    reason: "Responsible for lab equipment management and need to process student checkouts.",
  },
  {
    id: "3",
    name: "David Kim",
    email: "d.kim@university.edu",
    department: "IT Support",
    requestDate: "Jan 22, 2024",
    reason: "Part of the IT support team and require access to assign and track hardware issues.",
  },
]

const recentDecisions = [
  {
    id: "1",
    name: "Lisa Anderson",
    email: "l.anderson@university.edu",
    department: "Physics",
    decision: "Approved",
    decidedBy: "Robert Wilson",
    decidedAt: "Jan 21, 2024",
  },
  {
    id: "2",
    name: "James Brown",
    email: "j.brown@university.edu",
    department: "Marketing",
    decision: "Rejected",
    decidedBy: "Robert Wilson",
    decidedAt: "Jan 20, 2024",
    reason: "Insufficient justification for admin access level.",
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.d@university.edu",
    department: "IT Department",
    decision: "Approved",
    decidedBy: "Robert Wilson",
    decidedAt: "Jan 18, 2024",
  },
]

export default function AdminRequestsPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Admin Requests"
        description="Review and manage admin account requests"
      />

      <div className="p-6">
        {/* Stats */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <p className="text-sm font-medium text-amber-500">Pending Review</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-amber-500">3</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-emerald-500" />
              <p className="text-sm font-medium text-emerald-500">Approved This Month</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-emerald-500">8</p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-destructive" />
              <p className="text-sm font-medium text-destructive">Rejected This Month</p>
            </div>
            <p className="mt-2 text-3xl font-bold text-destructive">2</p>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-foreground">Pending Requests</h2>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border border-border bg-card p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-lg font-medium text-primary">
                      {request.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{request.name}</h3>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {request.email}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          Department: <span className="text-foreground">{request.department}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Requested: <span className="text-foreground">{request.requestDate}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 lg:shrink-0">
                    <Button variant="outline" size="sm" className="gap-2">
                      <X className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button size="sm" className="gap-2">
                      <Check className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
                <div className="mt-4 rounded-lg bg-secondary/50 p-4">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Reason for request:</span>{" "}
                    {request.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Decisions */}
        <div>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Decisions</h2>
          <div className="rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Applicant
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Decision
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Decided By
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentDecisions.map((decision) => (
                    <tr
                      key={decision.id}
                      className="transition-colors hover:bg-secondary/50"
                    >
                      <td className="whitespace-nowrap px-4 py-4">
                        <div>
                          <p className="font-medium text-foreground">{decision.name}</p>
                          <p className="text-sm text-muted-foreground">{decision.email}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                        {decision.department}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs font-medium",
                            decision.decision === "Approved"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                              : "border-destructive/20 bg-destructive/10 text-destructive"
                          )}
                        >
                          {decision.decision === "Approved" ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {decision.decision}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                        {decision.decidedBy}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                        {decision.decidedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
