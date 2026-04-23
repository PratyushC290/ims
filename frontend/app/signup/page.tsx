"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, ArrowRight, Mail, User, Building2, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

const roles = [
  { id: "student", label: "Student", description: "Request and track assigned assets" },
  { id: "faculty", label: "Faculty", description: "Manage department resources" },
  { id: "staff", label: "Staff", description: "Handle day-to-day operations" },
  { id: "admin", label: "Admin", description: "Full inventory management access" },
]

export default function SignupPage() {
  const [step, setStep] = useState<"info" | "role" | "success">("info")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [loading, setLoading] = useState(false)

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStep("role")
  }

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep("success")
    }, 1500)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-primary/20 via-background to-background p-12 lg:flex">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">InvenTrack</span>
        </Link>

        <div>
          <h1 className="text-4xl font-bold leading-tight text-foreground">
            Join Your Team on
            <br />
            <span className="text-primary">InvenTrack</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Get started in minutes. No credit card required.
            Full access to inventory management tools.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Passwordless authentication</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Role-based access control</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
              <Check className="h-3 w-3 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Complete audit trail</span>
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">InvenTrack</span>
          </Link>

          {step === "success" ? (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-8 w-8 text-emerald-500" />
              </div>
              <h2 className="mt-6 text-2xl font-bold text-foreground">
                {selectedRole === "admin" ? "Request Submitted" : "Account Created"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedRole === "admin"
                  ? "Your admin request is pending approval. You'll receive an email once it's reviewed."
                  : "Check your email for a verification link to activate your account."}
              </p>
              <Link href="/login">
                <Button className="mt-8 w-full">Go to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              {/* Progress */}
              <div className="mb-8 flex items-center justify-center gap-2">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  step === "info" ? "bg-primary" : "bg-primary/30"
                )} />
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  step === "role" ? "bg-primary" : "bg-primary/30"
                )} />
              </div>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Create account</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step === "info"
                    ? "Enter your information to get started"
                    : "Select your role in the organization"}
                </p>
              </div>

              {step === "info" ? (
                <form onSubmit={handleInfoSubmit} className="mt-8 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Full Name</label>
                    <div className="relative mt-1.5">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="bg-secondary pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Email Address</label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="you@university.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="bg-secondary pl-9"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <div className="relative mt-1.5">
                      <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Computer Science"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        required
                        className="bg-secondary pl-9"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gap-2"
                    disabled={!name || !email || !department}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRoleSubmit} className="mt-8 space-y-4">
                  <div className="space-y-3">
                    {roles.map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRole(role.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors",
                          selectedRole === role.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-secondary/50 hover:bg-secondary"
                        )}
                      >
                        <div
                          className={cn(
                            "mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2",
                            selectedRole === role.id
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          )}
                        >
                          {selectedRole === role.id && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{role.label}</p>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedRole === "admin" && (
                    <p className="rounded-lg bg-amber-500/10 p-3 text-xs text-amber-500">
                      Admin accounts require approval from a Super Admin before activation.
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep("info")}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 gap-2"
                      disabled={loading || !selectedRole}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
