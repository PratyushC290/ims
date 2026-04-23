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
  Mail,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  role: "Student" | "Faculty" | "Staff" | "Admin" | "Super Admin"
  department: string
  assignedItems: number
  status: "Active" | "Inactive"
  joinedAt: string
}

const roleStyles = {
  Student: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Faculty: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Staff: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  Admin: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  "Super Admin": "bg-rose-500/10 text-rose-500 border-rose-500/20",
}

interface UsersTableProps {
  users: User[]
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export function UsersTable({ users, onView, onEdit, onDelete }: UsersTableProps) {
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="rounded-xl border border-border bg-card">
      {/* Filters */}
      <div className="flex flex-col gap-4 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
                Role
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRoleFilter("all")}>
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("Student")}>
                Student
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("Faculty")}>
                Faculty
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("Staff")}>
                Staff
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("Admin")}>
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRoleFilter("Super Admin")}>
                Super Admin
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
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Role
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Assigned Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-secondary/50"
              >
                <td className="whitespace-nowrap px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-sm font-medium text-primary">
                      {user.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-1 text-xs font-medium",
                      roleStyles[user.role]
                    )}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                  {user.department}
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span className="rounded-full bg-secondary px-2 py-1 text-sm font-medium text-foreground">
                    {user.assignedItems}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-sm",
                      user.status === "Active" ? "text-emerald-500" : "text-muted-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        user.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground"
                      )}
                    />
                    {user.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm text-muted-foreground">
                  {user.joinedAt}
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onView(user.id)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(user.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(user.id)}
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
          Showing {filteredUsers.length} of {users.length} users
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
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
