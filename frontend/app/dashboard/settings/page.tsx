"use client"

import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Building2, Mail, Bell, Shield, Database, Palette } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header title="Settings" description="Manage system preferences" />

      <div className="p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Organization Settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Organization</h2>
                <p className="text-sm text-muted-foreground">Basic organization settings</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Organization Name</label>
                <Input defaultValue="IT Department" className="mt-1.5 bg-secondary" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Organization ID</label>
                <Input defaultValue="org_IT_2024_001" disabled className="mt-1.5 bg-secondary" />
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                <Mail className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Email Configuration</h2>
                <p className="text-sm text-muted-foreground">Configure OTP and notification emails</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">SMTP Host</label>
                <Input defaultValue="smtp.university.edu" className="mt-1.5 bg-secondary" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">SMTP Port</label>
                  <Input defaultValue="587" className="mt-1.5 bg-secondary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">From Email</label>
                  <Input defaultValue="noreply@university.edu" className="mt-1.5 bg-secondary" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Bell className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Notifications</h2>
                <p className="text-sm text-muted-foreground">Configure notification preferences</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {[
                { label: "New assignment notifications", enabled: true },
                { label: "Return reminders", enabled: true },
                { label: "Admin request alerts", enabled: true },
                { label: "Maintenance due alerts", enabled: false },
                { label: "Weekly summary report", enabled: false },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.label}</span>
                  <button
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      item.enabled ? "bg-primary" : "bg-secondary"
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                        item.enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-500/10">
                <Shield className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Security</h2>
                <p className="text-sm text-muted-foreground">Authentication and security settings</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">OTP Expiry (minutes)</label>
                  <Input defaultValue="5" type="number" className="mt-1.5 bg-secondary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Session Duration (hours)</label>
                  <Input defaultValue="8" type="number" className="mt-1.5 bg-secondary" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-foreground">Max Login Attempts</label>
                  <Input defaultValue="5" type="number" className="mt-1.5 bg-secondary" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Lockout Duration (minutes)</label>
                  <Input defaultValue="15" type="number" className="mt-1.5 bg-secondary" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </div>
          </div>

          {/* Database */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Database className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Data Management</h2>
                <p className="text-sm text-muted-foreground">Database and backup settings</p>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div>
                  <p className="font-medium text-foreground">Export All Data</p>
                  <p className="text-sm text-muted-foreground">Download complete system backup</p>
                </div>
                <Button variant="outline">Export</Button>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div>
                  <p className="font-medium text-foreground">Clear Audit Logs</p>
                  <p className="text-sm text-muted-foreground">Remove logs older than 90 days</p>
                </div>
                <Button variant="outline">Clear</Button>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Palette className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Appearance</h2>
                <p className="text-sm text-muted-foreground">Customize the interface</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center gap-4">
                <button className="flex flex-col items-center gap-2 rounded-lg border-2 border-primary bg-secondary/50 p-4">
                  <div className="h-8 w-8 rounded-full bg-zinc-900" />
                  <span className="text-xs font-medium text-foreground">Dark</span>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/50 p-4 opacity-50">
                  <div className="h-8 w-8 rounded-full bg-white border border-border" />
                  <span className="text-xs font-medium text-muted-foreground">Light</span>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-lg border border-border bg-secondary/50 p-4 opacity-50">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-white to-zinc-900" />
                  <span className="text-xs font-medium text-muted-foreground">System</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
