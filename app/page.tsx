"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { preloadAccounts } from "@/lib/store-account"
import { Mail, Phone } from "lucide-react"

export default function Home() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Initialize the store with preloaded data
    preloadAccounts()
  }, [])

  useEffect(() => {
    // Check for error messages in URL
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")

    if (errorParam === "subscription-expired") {
      setError("Your subscription has expired. Please contact the administrator.")
    }
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Import dynamically to avoid circular dependencies
    import("@/lib/store-account").then(({ login }) => {
      const result = login(username, password)
      if (result) {
        // Store the current user in localStorage
        localStorage.setItem("currentUser", username)
        router.push("/dashboard")
      } else {
        setError("Invalid username or password")
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-green-800 mb-2">SariWais</h1>
            <p className="text-lg text-green-600">Smart Management for Sari-Sari Stores 🛒📈📋</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Login to Your Store</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access your store management system
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="h-10"
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-10"
                    autoComplete="current-password"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-md text-sm">
                    {success}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-10">
                  Login
                </Button>

                <div className="w-full border-t border-gray-200 pt-4">
                  <p className="text-sm text-center text-gray-600 font-medium">
                    Don't have an account? Contact the administrator to get access.
                  </p>
                  <div className="mt-3 flex flex-col space-y-2">
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-green-600" />
                      <span>0995-578-7051</span>
                    </div>
                    <div className="flex items-center justify-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-green-600" />
                      <span>official.sariwais@gmail.com</span>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
