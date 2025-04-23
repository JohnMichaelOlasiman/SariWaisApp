"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { findByUsername } from "@/lib/store-account"
import type { InventoryItem } from "@/lib/inventory-item"
import type { Transaction } from "@/lib/transaction"
import DashboardLayout from "@/components/dashboard-layout"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { PieChart, Pie, Cell, Legend } from "recharts"

export default function Dashboard() {
  const router = useRouter()
  const [storeName, setStoreName] = useState("")
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [totalTransactions, setTotalTransactions] = useState(0)

  useEffect(() => {
    const username = localStorage.getItem("currentUser")
    if (!username) {
      router.push("/")
      return
    }

    const account = findByUsername(username)
    if (!account) {
      router.push("/")
      return
    }

    // Check if subscription is expired (except for admin)
    if (username !== "admin") {
      const subscription = account.getSubscription()
      if (subscription.status === "expired") {
        localStorage.removeItem("currentUser")
        router.push("/?error=subscription-expired")
        return
      }
    }

    setStoreName(account.getStoreName())

    // Get low stock items
    const lowStock = account.getInventoryController().checkLowStock()
    setLowStockItems(lowStock)

    // Get recent transactions (last 5)
    const transactions = account.getTransactions()
    setRecentTransactions(transactions.slice(-5).reverse())

    // Calculate total revenue and transactions
    setTotalRevenue(transactions.reduce((sum, t) => sum + t.getTotalAmount(), 0))
    setTotalTransactions(transactions.length)

    // Calculate total profit
    const totalCost = transactions.reduce((sum, t) => {
      return (
        sum +
        t.getItemsSold().reduce((itemSum, item) => {
          return itemSum + item.getItem().getPurchasePrice() * item.getQuantity()
        }, 0)
      )
    }, 0)
    setTotalProfit(totalRevenue - totalCost)

    // Prepare sales data for chart
    const salesByDate = transactions.reduce((acc: any, transaction) => {
      const date = transaction.getTransactionDate().toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = 0
      }
      acc[date] += transaction.getTotalAmount()
      return acc
    }, {})

    const chartData = Object.keys(salesByDate)
      .map((date) => ({
        date,
        amount: salesByDate[date],
      }))
      .slice(-7) // Last 7 days

    setSalesData(chartData)

    // Prepare category data for pie chart
    const inventory = account.getInventoryController().viewInventory()
    const categories = inventory.reduce((acc: any, item) => {
      const category = item.getCategory()
      if (!acc[category]) {
        acc[category] = 0
      }
      acc[category] += item.getStock()
      return acc
    }, {})

    const pieData = Object.keys(categories).map((category) => ({
      name: category,
      value: categories[category],
    }))

    setCategoryData(pieData)
  }, [router, totalRevenue])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-3xl font-bold text-green-800 mb-6">Welcome to {storeName}</h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
                <CardDescription>Overall store revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">₱{totalRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Profit</CardTitle>
                <CardDescription>Net profit after expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">₱{totalProfit.toFixed(2)}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Transactions</CardTitle>
                <CardDescription>Number of sales</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{totalTransactions}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Last 7 days of sales</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₱${value}`, "Amount"]} />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="col-span-1"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Distribution of products</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Items"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>Items that need to be restocked</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-gray-500">No items are low in stock.</p>
                ) : (
                  <div className="space-y-4">
                    {lowStockItems.map((item, index) => (
                      <motion.div
                        key={item.getProductId()}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div>
                          <p className="font-medium">{item.getProductName()}</p>
                          <p className="text-sm text-gray-500">
                            Current stock: <span className="text-red-500 font-medium">{item.getStock()}</span> /
                            Threshold: {item.getLowStockThreshold()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => router.push("/inventory")}
                        >
                          Restock
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest sales</CardDescription>
              </CardHeader>
              <CardContent>
                {recentTransactions.length === 0 ? (
                  <p className="text-gray-500">No recent transactions.</p>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.getTransactionId()}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100"
                      >
                        <div>
                          <p className="font-medium">{transaction.getCustomerName() || "Walk-in Customer"}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.getTransactionDate().toLocaleDateString()} -{" "}
                            {transaction.getItemsSold().length} items
                          </p>
                        </div>
                        <p className="font-medium text-green-600">₱{transaction.getTotalAmount().toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
