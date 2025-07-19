"use client"

import Link from "next/link"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Code2, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-purple-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Schema Builder Pro
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-gray-600 hover:text-purple-600 transition-colors">
              Features
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-purple-600 transition-colors">
              Testimonials
            </Link>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {session ? (
                <>
                  <Link href="/builder">
                    <Button variant="outline">Go to Builder</Button>
                  </Link>
                  <UserNav />
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => signIn()}>
                    Sign In
                  </Button>
                  <Button onClick={() => signIn()}>
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t">
          <div className="px-4 py-4 space-y-4">
            <Link href="#features" className="block text-gray-600 hover:text-purple-600">
              Features
            </Link>
            <Link href="#testimonials" className="block text-gray-600 hover:text-purple-600">
              Testimonials
            </Link>
            <div className="flex justify-center mb-4">
              <ThemeToggle />
            </div>
            {session ? (
              <div className="space-y-2">
                <Link href="/builder">
                  <Button variant="outline" className="w-full">Go to Builder</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                <Button variant="outline" onClick={() => signIn()} className="w-full">
                  Sign In
                </Button>
                <Button onClick={() => signIn()} className="w-full">
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
