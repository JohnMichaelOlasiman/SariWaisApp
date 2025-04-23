"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { findByUsername } from "@/lib/store-account"
import { motion } from "framer-motion"
import { Home, Package, ShoppingCart, BarChart2, Menu, LogOut, User, Store } from "lucide-react"
// Import the SubscriptionStatus component
import { SubscriptionStatus } from "@/components/subscription-status"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [storeName, setStoreName] = useState("")
  const [username, setUsername] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser")
    if (!currentUser) {
      router.push("/")
      return
    }

    const account = findByUsername(currentUser)
    if (!account) {
      router.push("/")
      return
    }

    setStoreName(account.getStoreName())
    setUsername(currentUser)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    router.push("/")
  }

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Transactions", href: "/transactions", icon: ShoppingCart },
    { name: "Sales", href: "/sales", icon: BarChart2 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64">
                <div className="flex flex-col h-full">
                  <div className="py-4 border-b">
                    <div className="flex items-center px-2">
                      <Store className="h-6 w-6 text-green-600 mr-2" />
                      <h2 className="text-xl font-bold text-green-800">{storeName}</h2>
                    </div>
                    <p className="text-sm text-gray-500 px-2 mt-1">Logged in as {username}</p>
                  </div>
                  <nav className="flex-1 py-4">
                    <ul className="space-y-2">
                      {navItems.map((item) => (
                        <li key={item.name}>
                          <Link
                            href={item.href}
                            className="flex items-center px-2 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </nav>
                  <div className="py-4 border-t">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Link href="/dashboard" className="flex items-center">
              <Store className="h-6 w-6 text-green-600 mr-2 hidden md:block" />
              <h1 className="text-xl font-bold text-green-800">SariWais</h1>
            </Link>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center mr-4">
              <User className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">{username}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-5 w-5 mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        <aside className="hidden md:block w-64 bg-white border-r border-gray-200">
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold text-green-800">{storeName}</h2>
              <p className="text-sm text-gray-500 mt-1">Sari-Sari Store</p>
            </div>
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {navItems.map((item, index) => (
                  <motion.li
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center px-3 py-2 text-gray-700 hover:bg-green-50 hover:text-green-700 rounded-md"
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.name}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              {username !== "admin" && (
                <div className="mt-6 px-4">
                  <SubscriptionStatus username={username} />
                </div>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
