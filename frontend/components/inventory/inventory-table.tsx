"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface InventoryItem {
  id: string
  name: string
  uniqueId: string
  category: "Hardware" | "Software License" | "Accessories"
  status: "Available" | "Assigned" | "Under Maintenance" | "Retired"
  assignedTo?: string
  location?: string
  createdAt: string
}

const statusStyles = {
  Available: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Assigned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  "Under Maintenance": "bg-amber-500/10 text-amber-500 border-amber-500/20",
  Retired: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
}

const categoryStyles = {
  Hardware: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  "Software License": "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Accessories: "bg-pink-500/10 text-pink-500 border-pink-500/20",
}

interface InventoryTableProps {
  items: InventoryItem[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function InventoryTable({ items, onView, onEdit, onDelete }: InventoryTableProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.uniqueId.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Filters */}
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                All Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Available")}>
                Available
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Assigned")}>
                Assigned
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Under Maintenance")}>
                Under Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Retired")}>
                Retired
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Asset Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Unique ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Assigned To
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Created
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredItems.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-secondary/50"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <span className="font-medium text-foreground">{item.name}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <code className="rounded bg-secondary px-2 py-1 text-xs text-muted-foreground">
                    {item.uniqueId}
                  </code>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
                      categoryStyles[item.category]
                    )}
                  >
                    {item.category}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
                      statusStyles[item.status]
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                  {item.assignedTo || "-"}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                  {item.createdAt}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(item.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(item.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(item.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing {filteredItems.length} of {items.length} items
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" disabled>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="ghost" size="sm">
            2
          </Button>
          <Button variant="ghost" size="sm">
            3
          </Button>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
