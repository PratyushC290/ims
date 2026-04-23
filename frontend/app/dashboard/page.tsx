"use client"

import { Header } from "@/components/layout/header"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ActivityList } from "@/components/dashboard/activity-list"
import { ActionRequired } from "@/components/dashboard/action-required"
import { Package, Clock, CheckCircle, Truck } from "lucide-react"

const stats = [
  { title: "Total Assets", value: 127, icon: Package, variant: "primary" as const },
  { title: "In Review", value: 6, icon: Clock, variant: "warning" as const },
  { title: "Approved", value: 89, icon: CheckCircle, variant: "success" as const },
  { title: "Deliveries", value: 12, icon: Truck, variant: "default" as const },
]

const recentActivity = [
  {
    id: "1",
    type: "assigned" as const,
    description: "MacBook Pro 14\" assigned to Engineering",
    user: "user_9X8gvnVc9XBvnseO7HwyOjpS",
    timestamp: "10:45am",
  },
  {
    id: "2",
    type: "returned" as const,
    description: "Dell Monitor returned from Marketing",
    user: "user_3K9hpnWc8XCvmteP8IxyPkqT",
    timestamp: "09:30am",
  },
  {
    id: "3",
    type: "maintenance" as const,
    description: "HP Printer scheduled for maintenance",
    user: "user_5L1jpnXc7XDvlseQ9JzyQlrU",
    timestamp: "08:15am",
  },
  {
    id: "4",
    type: "created" as const,
    description: "New batch of 10 monitors added",
    user: "user_2M2kpnYc6XEvkteR0KzyRmsV",
    timestamp: "Yesterday",
  },
]

const actionItems = [
  {
    id: "1",
    title: "QC Logo vector",
    description: "Asset#1FscafeC091h1hsd6boD",
    timestamp: "10:45am 01/15/2024",
  },
  {
    id: "2",
    title: "Handshake",
    description: "Asset#Axa5cdXBFfN 1odAyeHe",
    timestamp: "10:45am 01/15/2024",
  },
  {
    id: "3",
    title: "Gift",
    description: "Asset#eB1c3hnAtbbsvOFVxSW",
    timestamp: "10:45am 01/15/2024",
  },
  {
    id: "4",
    title: "ican_logo",
    description: "Asset#cxdPzcv2Rk2iRtvzkBvo9",
    timestamp: "10:45am 01/15/2024",
  },
]

export default function DashboardPage() {
  const handleReview = (id: string) => {
    console.log("Reviewing item:", id)
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        description="Overview of your IMS environment."
        action={{
          label: "Add Asset",
          onClick: () => console.log("Add asset"),
        }}
      />

      <div className="p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))}
        </div>

        {/* Action Required & Activity */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <ActionRequired items={actionItems} onReview={handleReview} />
          <ActivityList
            title="Recent Activity"
            activities={recentActivity}
            showViewAll
          />
        </div>
      </div>
    </div>
  )
}
