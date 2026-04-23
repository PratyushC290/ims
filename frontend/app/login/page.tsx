"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Package, ArrowRight, Mail, KeyRound, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [step, setStep] = useState<"email" | "otp">("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      setStep("otp")
    }, 1500)
  }

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      window.location.href = "/dashboard"
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
            Inventory Management
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Track, assign, and manage your institutional assets with ease. 
            Secure, efficient, and built for teams.
          </p>
        </div>

        <div className="flex items-center gap-8 text-sm text-muted-foreground">
          <div>
            <p className="text-2xl font-bold text-foreground">10k+</p>
            <p>Assets Managed</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">500+</p>
            <p>Organizations</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">99.9%</p>
            <p>Uptime</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <Link href="/" className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">InvenTrack</span>
          </Link>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {step === "email"
                ? "Enter your institutional email to continue"
                : `We sent a code to ${email}`}
            </p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
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

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || !email}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending code...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">
                  One-Time Password
                </label>
                <div className="relative mt-1.5">
                  <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="bg-secondary pl-9 tracking-widest"
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Code expires in 5 minutes
                </p>
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>

              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Use a different email
              </button>
            </form>
          )}

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  New to InvenTrack?
                </span>
              </div>
            </div>

            <Link href="/signup">
              <Button variant="outline" className="mt-4 w-full">
                Create an account
              </Button>
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
