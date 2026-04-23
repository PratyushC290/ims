"use client"

import { Header } from "@/components/layout/header"
import { UsersTable } from "@/components/users/users-table"

const users = [
  {
    id: "1",
    name: "John Smith",
    email: "john.smith@university.edu",
    role: "Faculty" as const,
    department: "Computer Science",
    assignedItems: 3,
    status: "Active" as const,
    joinedAt: "Jan 15, 2024",
  },
  {
    id: "2",
    name: "Sarah Johnson",
    email: "sarah.j@university.edu",
    role: "Staff" as const,
    department: "Marketing",
    assignedItems: 2,
    status: "Active" as const,
    joinedAt: "Jan 10, 2024",
  },
  {
    id: "3",
    name: "Mike Chen",
    email: "mike.chen@university.edu",
    role: "Student" as const,
    department: "Engineering",
    assignedItems: 1,
    status: "Active" as const,
    joinedAt: "Jan 08, 2024",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily.d@university.edu",
    role: "Admin" as const,
    department: "IT Department",
    assignedItems: 0,
    status: "Active" as const,
    joinedAt: "Dec 20, 2023",
  },
  {
    id: "5",
    name: "Robert Wilson",
    email: "r.wilson@university.edu",
    role: "Super Admin" as const,
    department: "Administration",
    assignedItems: 0,
    status: "Active" as const,
    joinedAt: "Nov 15, 2023",
  },
  {
    id: "6",
    name: "Lisa Anderson",
    email: "l.anderson@university.edu",
    role: "Faculty" as const,
    department: "Physics",
    assignedItems: 4,
    status: "Inactive" as const,
    joinedAt: "Oct 01, 2023",
  },
]

export default function UsersPage() {
  const handleView = (id: string) => {
    console.log("View user:", id)
  }

  const handleEdit = (id: string) => {
    console.log("Edit user:", id)
  }

  const handleDelete = (id: string) => {
    console.log("Delete user:", id)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Users"
        description="Manage system users and their roles"
        action={{
          label: "Add User",
          onClick: () => console.log("Add user"),
        }}
      />

      <div className="p-6">
        <UsersTable
          users={users}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
