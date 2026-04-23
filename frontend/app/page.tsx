"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Package,
  ArrowRight,
  Shield,
  BarChart3,
  Users,
  Zap,
  CheckCircle,
  Clock,
  Lock,
} from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Asset Tracking",
    description: "Track hardware, software licenses, and accessories with unique identifiers",
  },
  {
    icon: Users,
    title: "Role-Based Access",
    description: "Define permissions for Students, Faculty, Staff, Admins, and Super Admins",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "Passwordless OTP-based login with rate limiting and session management",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor asset utilization, assignments, and trends with detailed reports",
  },
  {
    icon: Clock,
    title: "Assignment Lifecycle",
    description: "Seamlessly manage checkouts, returns, and maintenance schedules",
  },
  {
    icon: Lock,
    title: "Complete Audit Trail",
    description: "Track every action with timestamped logs for compliance and security",
  },
]

const stats = [
  { value: "10k+", label: "Assets Tracked" },
  { value: "500+", label: "Organizations" },
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">InvenTrack</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary"
            >
              <Zap className="h-4 w-4" />
              New Features Available
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="max-w-4xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Inventory Management
              <br />
              for <span className="text-primary">Ambitious Teams</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg text-muted-foreground"
            >
              InvenTrack is a powerful platform for your institutional asset needs. 
              Organize, approve, version and distribute your assets, all in one place.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/dashboard">
                <Button size="lg" className="gap-2">
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-16"
            >
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.5 + idx * 0.1 }}
                  className="text-center"
                >
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="relative mt-20"
          >
            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-cyan-500/20 blur-xl" />
            <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              {/* Mock Dashboard */}
              <div className="flex">
                {/* Sidebar */}
                <div className="hidden w-48 border-r border-border bg-sidebar p-4 lg:block">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="h-6 w-6 rounded bg-primary" />
                    <span className="text-sm font-semibold text-foreground">InvenTrack</span>
                  </div>
                  {["Dashboard", "Inventory", "Users", "Assignments", "Analytics"].map((item, idx) => (
                    <div
                      key={item}
                      className={`mb-2 rounded-lg px-3 py-2 text-xs ${
                        idx === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {item}
                    </div>
                  ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <div className="h-5 w-24 rounded bg-foreground/20" />
                      <div className="mt-1 h-3 w-40 rounded bg-muted-foreground/20" />
                    </div>
                    <div className="h-8 w-24 rounded-lg bg-primary" />
                  </div>

                  {/* Stats Cards */}
                  <div className="mb-6 grid gap-4 md:grid-cols-4">
                    {[
                      { value: "127", label: "Total Assets", color: "bg-primary/10" },
                      { value: "6", label: "In Review", color: "bg-amber-500/10" },
                      { value: "89", label: "Approved", color: "bg-emerald-500/10" },
                      { value: "12", label: "Deliveries", color: "bg-secondary" },
                    ].map((card) => (
                      <motion.div
                        key={card.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.8 }}
                        className={`rounded-xl ${card.color} p-4`}
                      >
                        <div className="text-xs text-muted-foreground">{card.label}</div>
                        <div className="mt-1 text-2xl font-bold text-foreground">{card.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Activity Cards */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <div className="h-2 w-2 rounded-full bg-destructive" />
                        Action Required
                      </div>
                      <div className="mt-3 space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-2">
                            <div className="h-3 w-32 rounded bg-muted-foreground/20" />
                            <div className="h-6 w-14 rounded bg-secondary" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-4">
                      <div className="text-xs font-medium text-foreground">Recent Activity</div>
                      <div className="mt-3 space-y-2">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-2">
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-12 rounded bg-primary/30" />
                              <div className="h-3 w-24 rounded bg-muted-foreground/20" />
                            </div>
                            <div className="h-3 w-12 rounded bg-muted-foreground/10" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Everything you need to manage assets
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built for institutions, designed for simplicity
            </p>
          </motion.div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-card/80"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-card p-8 sm:p-12"
          >
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
                Ready to streamline your inventory?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-muted-foreground">
                Join hundreds of organizations already using InvenTrack to manage their assets efficiently.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  No credit card required
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  14-day free trial
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Package className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">InvenTrack</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} InvenTrack. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
