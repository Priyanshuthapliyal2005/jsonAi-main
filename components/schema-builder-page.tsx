"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SchemaBuilder } from "@/components/schema-builder/SchemaBuilder"
import { UserNav } from "@/components/user-nav"
import { Button } from "@/components/ui/button"
import { Code2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
export function SchemaBuilderPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex flex-row items-center justify-between py-2 gap-2 w-full">
            <div className="flex flex-row items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              {/* <Code2 className="h-6 w-6 text-purple-600" /> */}
              {/* <span className="text-lg font-semibold">Schema Builder</span> */}
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-full overflow-x-hidden">
        <SchemaBuilder />
      </main>
    </div>
  )
}