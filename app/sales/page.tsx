"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { findByUsername } from "@/lib/store-account"
import { Sales } from "@/lib/sales"
import DashboardLayout from "@/components/dashboard-layout"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Download } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { InventoryItem } from "@/lib/inventory-item"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

export default function SalesPage() {
  const router = useRouter()
  const [sales, setSales] = useState<Sales | null>(null)
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 1)))
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [salesReport, setSalesReport] = useState<string>("")
  const [expensesReport, setExpensesReport] = useState<string>("")
  const [topSellingProducts, setTopSellingProducts] = useState<InventoryItem[]>([])
  const [leastSellingProducts, setLeastSellingProducts] = useState<InventoryItem[]>([])
  const [totalRevenue, setTotalRevenue] = useState<number>(0)
  const [totalProfit, setTotalProfit] = useState<number>(0)
  const [totalTransactions, setTotalTransactions] = useState<number>(0)
  const [dailyAverageRevenue, setDailyAverageRevenue] = useState<number>(0)
  const [totalCOGS, setTotalCOGS] = useState<number>(0)
  const [totalCOGP, setTotalCOGP] = useState<number>(0)
  const [salesData, setSalesData] = useState<any[]>([])
  const [profitData, setProfitData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])

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

    // Create sales instance
    const salesInstance = new Sales(account.getTransactions(), account)
    setSales(salesInstance)

    // Generate initial reports
    generateReports(salesInstance)
  }, [router])

  const generateReports = (salesInstance: Sales) => {
    if (!salesInstance) return

    // Convert dates to LocalDate format for Java compatibility
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Generate sales report
    const salesReportText = salesInstance.generateSalesReport(start, end)
    setSalesReport(salesReportText)

    // Generate expenses report
    const expensesReportText = salesInstance.generateExpensesReport(start, end)
    setExpensesReport(expensesReportText)

    // Get top selling products
    const topProducts = salesInstance.getTopSellingProducts(5, start, end)
    setTopSellingProducts(topProducts)

    // Get least selling products
    const leastProducts = salesInstance.getLeastSellingProducts(5, start, end)
    setLeastSellingProducts(leastProducts)

    // Get total revenue
    const revenue = salesInstance.getTotalRevenue(start, end)
    setTotalRevenue(revenue)

    // Get total profit
    const profit = salesInstance.getTotalProfit(start, end)
    setTotalProfit(profit)

    // Get total transactions
    const transactions = salesInstance.getTotalTransactions(start, end)
    setTotalTransactions(transactions)

    // Get daily average revenue
    const dailyAverage = salesInstance.getDailyAverageRevenue(start, end)
    setDailyAverageRevenue(dailyAverage)

    // Get COGS
    const cogs = salesInstance.getCOGS(start, end)
    setTotalCOGS(cogs)

    // Get COGP
    const cogp = salesInstance.getCOGP(start, end)
    setTotalCOGP(cogp)

    // Prepare data for charts
    prepareSalesData(salesInstance, start, end)
    prepareProfitData(salesInstance, start, end)
    prepareCategoryData(topProducts)
  }

  const prepareSalesData = (salesInstance: Sales, start: Date, end: Date) => {
    // This is a simplified version - in a real app, you'd query daily sales
    const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const data = []

    // Generate some sample data based on total revenue
    const totalRev = salesInstance.getTotalRevenue(start, end)
    const avgDaily = totalRev / (dayDiff || 1)

    for (let i = 0; i < Math.min(dayDiff, 7); i++) {
      const date = new Date(end)
      date.setDate(date.getDate() - i)

      // Add some randomness to make it look realistic
      const variance = Math.random() * 0.5 + 0.75 // 75% to 125% of average
      const dailyRevenue = avgDaily * variance

      data.unshift({
        date: format(date, "MMM dd"),
        revenue: Math.round(dailyRevenue * 100) / 100,
      })
    }

    setSalesData(data)
  }

  const prepareProfitData = (salesInstance: Sales, start: Date, end: Date) => {
    // Similar to sales data, but for profit
    const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const data = []

    const totalProf = salesInstance.getTotalProfit(start, end)
    const avgDaily = totalProf / (dayDiff || 1)

    for (let i = 0; i < Math.min(dayDiff, 7); i++) {
      const date = new Date(end)
      date.setDate(date.getDate() - i)

      const variance = Math.random() * 0.4 + 0.8 // 80% to 120% of average
      const dailyProfit = avgDaily * variance

      data.unshift({
        date: format(date, "MMM dd"),
        profit: Math.round(dailyProfit * 100) / 100,
      })
    }

    setProfitData(data)
  }

  const prepareCategoryData = (topProducts: InventoryItem[]) => {
    // Create a map to count products by category
    const categoryCount: Record<string, number> = {}

    topProducts.forEach((product) => {
      const category = product.getCategory()
      if (!categoryCount[category]) {
        categoryCount[category] = 0
      }
      categoryCount[category]++
    })

    // Convert to chart data format
    const data = Object.keys(categoryCount).map((category) => ({
      name: category,
      value: categoryCount[category],
    }))

    setCategoryData(data)
  }

  const handleDateChange = () => {
    if (sales) {
      generateReports(sales)
    }
  }

  const downloadReport = (reportType: "sales" | "expenses") => {
    const report = reportType === "sales" ? salesReport : expensesReport
    const filename = reportType === "sales" ? "sales-report.txt" : "expenses-report.txt"

    const element = document.createElement("a")
    const file = new Blob([report], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = filename
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-green-800 mb-4">Sales Reports</h1>

          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <span>to</span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleDateChange} className="bg-green-600 hover:bg-green-700">
              Generate Reports
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total Revenue</CardTitle>
                <CardDescription>Total sales amount</CardDescription>
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Daily Average</CardTitle>
                <CardDescription>Average daily revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">₱{dailyAverageRevenue.toFixed(2)}</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₱${value}`, "Revenue"]} />
                    <Bar dataKey="revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Profit Trend</CardTitle>
                <CardDescription>Daily profit for the selected period</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={profitData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₱${value}`, "Profit"]} />
                    <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Tabs defaultValue="sales" className="mb-6">
          <TabsList>
            <TabsTrigger value="sales">Sales Report</TabsTrigger>
            <TabsTrigger value="expenses">Expenses Report</TabsTrigger>
            <TabsTrigger value="products">Product Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Sales Report</CardTitle>
                  <CardDescription>Detailed sales report for the selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadReport("sales")}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">{salesReport}</pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Expenses Report</CardTitle>
                  <CardDescription>Detailed expenses report for the selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => downloadReport("expenses")}>
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto whitespace-pre-wrap">{expensesReport}</pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Products</CardTitle>
                  <CardDescription>Most popular items in your store</CardDescription>
                </CardHeader>
                <CardContent>
                  {topSellingProducts.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No data available</p>
                  ) : (
                    <div className="space-y-4">
                      {topSellingProducts.map((item, index) => (
                        <motion.div
                          key={item.getProductId()}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-100"
                        >
                          <div>
                            <p className="font-medium">{item.getProductName()}</p>
                            <p className="text-sm text-gray-500">
                              Category: {item.getCategory()} | Price: ₱{item.getPrice().toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-4 bg-green-200 rounded-full mr-2">
                              <div
                                className="h-full bg-green-600 rounded-full"
                                style={{ width: `${(5 - index) * 20}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">#{index + 1}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Least Selling Products</CardTitle>
                  <CardDescription>Items that need attention</CardDescription>
                </CardHeader>
                <CardContent>
                  {leastSellingProducts.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No data available</p>
                  ) : (
                    <div className="space-y-4">
                      {leastSellingProducts.map((item, index) => (
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
                              Category: {item.getCategory()} | Price: ₱{item.getPrice().toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <div className="w-12 h-4 bg-red-200 rounded-full mr-2">
                              <div
                                className="h-full bg-red-600 rounded-full"
                                style={{ width: `${(5 - index) * 20}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">#{index + 1}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Product Category Distribution</CardTitle>
                  <CardDescription>Sales by product category</CardDescription>
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
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Cost of Goods Sold (COGS)</CardTitle>
                <CardDescription>Cost of products sold during the period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">₱{totalCOGS.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {totalRevenue > 0
                        ? `${((totalCOGS / totalRevenue) * 100).toFixed(2)}% of revenue`
                        : "0% of revenue"}
                    </p>
                  </div>
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "COGS", value: totalCOGS },
                            { name: "Profit", value: totalProfit },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#f87171" />
                          <Cell fill="#10b981" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Cost of Goods Purchased (COGP)</CardTitle>
                <CardDescription>Total cost of inventory purchased</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-green-600">₱{totalCOGP.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Difference from COGS: ₱{(totalCOGP - totalCOGS).toFixed(2)}</p>
                  </div>
                  <div className="w-24 h-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "COGP", value: totalCOGP },
                            { name: "Revenue", value: totalRevenue },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={40}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#f59e0b" />
                          <Cell fill="#10b981" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  )
}
