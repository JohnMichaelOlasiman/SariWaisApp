"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { findByUsername } from "@/lib/store-account"
import { AlertCircle, CheckCircle, Clock, Phone } from "lucide-react"

interface SubscriptionStatusProps {
  username: string
}

export function SubscriptionStatus({ username }: SubscriptionStatusProps) {
  const [status, setStatus] = useState<string>("loading")
  const [expiryDate, setExpiryDate] = useState<Date | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)

  useEffect(() => {
    const account = findByUsername(username)
    if (account) {
      const subscription = account.getSubscription()
      setStatus(subscription.status)
      setExpiryDate(subscription.expiryDate)

      if (subscription.expiryDate) {
        const now = new Date()
        const diffTime = subscription.expiryDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        setDaysRemaining(diffDays)
      }
    }
  }, [username])

  if (status === "loading") {
    return null
  }

  return (
    <Card
      className={
        status === "active"
          ? "border-green-200 bg-green-50"
          : status === "trial"
            ? "border-blue-200 bg-blue-50"
            : "border-red-200 bg-red-50"
      }
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          {status === "active" ? (
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
          ) : status === "trial" ? (
            <Clock className="h-5 w-5 text-blue-600 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
          )}
          Subscription Status: {status.charAt(0).toUpperCase() + status.slice(1)}
        </CardTitle>
        <CardDescription>
          {status === "expired"
            ? "Your subscription has expired. Please contact the administrator to renew."
            : `Your subscription ${status === "trial" ? "trial" : ""} expires on ${expiryDate?.toLocaleDateString()}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status !== "expired" && (
          <div className="flex flex-col space-y-2">
            <span className="text-sm">{daysRemaining} days remaining</span>
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <Phone className="h-4 w-4 mr-2" />
              <span>Need help? Contact 0995-578-7051</span>
            </div>
          </div>
        )}
        {status === "expired" && (
          <div className="space-y-3">
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full">
              Renew Subscription
            </Button>
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <Phone className="h-4 w-4 mr-2" />
              <span>Need help? Contact 0995-578-7051</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
