"use client"

import { Header } from "@/components/layout/header"
import { InventoryTable } from "@/components/inventory/inventory-table"

const inventoryItems = [
  {
    id: "1",
    name: "MacBook Pro 14\"",
    uniqueId: "MBP-2024-001",
    category: "Hardware" as const,
    status: "Assigned" as const,
    assignedTo: "John Smith",
    createdAt: "Jan 15, 2024",
  },
  {
    id: "2",
    name: "Dell UltraSharp 27\"",
    uniqueId: "MON-2024-045",
    category: "Hardware" as const,
    status: "Available" as const,
    createdAt: "Jan 12, 2024",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    uniqueId: "SW-ACC-2024-012",
    category: "Software License" as const,
    status: "Assigned" as const,
    assignedTo: "Sarah Johnson",
    createdAt: "Jan 10, 2024",
  },
  {
    id: "4",
    name: "Logitech MX Master 3",
    uniqueId: "ACC-LG-2024-089",
    category: "Accessories" as const,
    status: "Available" as const,
    createdAt: "Jan 08, 2024",
  },
  {
    id: "5",
    name: "HP LaserJet Pro",
    uniqueId: "PRN-HP-2024-003",
    category: "Hardware" as const,
    status: "Under Maintenance" as const,
    createdAt: "Jan 05, 2024",
  },
  {
    id: "6",
    name: "Microsoft 365 Business",
    uniqueId: "SW-MS365-2024-078",
    category: "Software License" as const,
    status: "Retired" as const,
    createdAt: "Dec 28, 2023",
  },
  {
    id: "7",
    name: "Thunderbolt Dock",
    uniqueId: "ACC-TB-2024-022",
    category: "Accessories" as const,
    status: "Available" as const,
    createdAt: "Jan 18, 2024",
  },
  {
    id: "8",
    name: "Dell XPS 15",
    uniqueId: "LPT-DELL-2024-015",
    category: "Hardware" as const,
    status: "Assigned" as const,
    assignedTo: "Mike Chen",
    createdAt: "Jan 20, 2024",
  },
]

export default function InventoryPage() {
  const handleView = (id: string) => {
    console.log("View item:", id)
  }

  const handleEdit = (id: string) => {
    console.log("Edit item:", id)
  }

  const handleDelete = (id: string) => {
    console.log("Delete item:", id)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Inventory"
        description="Manage all institutional assets"
        action={{
          label: "Add Item",
          onClick: () => console.log("Add item"),
        }}
      />

      <div className="p-6">
        <InventoryTable
          items={inventoryItems}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  )
}
