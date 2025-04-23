"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { findByUsername } from "@/lib/store-account"
import type { InventoryItem } from "@/lib/inventory-item"
import { Transaction } from "@/lib/transaction"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Plus, ShoppingCart, X, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function Transactions() {
  const router = useRouter()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // New transaction state
  const [newTransactionDialogOpen, setNewTransactionDialogOpen] = useState(false)
  const [customerName, setCustomerName] = useState("")
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedItems, setSelectedItems] = useState<{ item: InventoryItem; quantity: number }[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<string>("1")
  const [error, setError] = useState("")
  const [totalAmount, setTotalAmount] = useState(0)

  // Success message
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Transaction details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

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

    // Get transactions
    const allTransactions = account.getTransactions()
    setTransactions(allTransactions)
    setFilteredTransactions(allTransactions)

    // Get inventory for new transaction
    const inventoryItems = account.getInventoryController().viewInventory()
    setInventory(inventoryItems)
  }, [router])

  useEffect(() => {
    // Filter transactions based on search term and date
    let filtered = transactions

    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.getTransactionId().toLowerCase().includes(searchTerm.toLowerCase()) ||
          (transaction.getCustomerName() &&
            transaction.getCustomerName().toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    if (dateFilter !== "all") {
      const today = new Date()
      const startDate = new Date()

      switch (dateFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0)
          filtered = filtered.filter((transaction) => {
            const transactionDate = new Date(transaction.getTransactionDate())
            return transactionDate >= startDate && transactionDate <= today
          })
          break
        case "week":
          startDate.setDate(today.getDate() - 7)
          filtered = filtered.filter((transaction) => {
            const transactionDate = new Date(transaction.getTransactionDate())
            return transactionDate >= startDate && transactionDate <= today
          })
          break
        case "month":
          startDate.setMonth(today.getMonth() - 1)
          filtered = filtered.filter((transaction) => {
            const transactionDate = new Date(transaction.getTransactionDate())
            return transactionDate >= startDate && transactionDate <= today
          })
          break
      }
    }

    // Sort by date (newest first)
    filtered = [...filtered].sort((a, b) => {
      const dateA = new Date(a.getTransactionDate())
      const dateB = new Date(b.getTransactionDate())
      return dateB.getTime() - dateA.getTime()
    })

    setFilteredTransactions(filtered)
  }, [searchTerm, dateFilter, transactions])

  const addItemToTransaction = () => {
    setError("")

    if (!selectedItemId) {
      setError("Please select a product")
      return
    }

    const quantity = Number.parseInt(selectedQuantity)
    if (isNaN(quantity) || quantity <= 0) {
      setError("Quantity must be a positive number")
      return
    }

    const item = inventory.find((item) => item.getProductId() === selectedItemId)
    if (!item) {
      setError("Product not found")
      return
    }

    if (item.getStock() < quantity) {
      setError(`Insufficient stock. Only ${item.getStock()} available.`)
      return
    }

    // Check if item already exists in the transaction
    const existingItemIndex = selectedItems.findIndex((i) => i.item.getProductId() === selectedItemId)
    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = selectedItems[existingItemIndex].quantity + quantity
      if (item.getStock() < newQuantity) {
        setError(`Insufficient stock. Only ${item.getStock()} available.`)
        return
      }

      const updatedItems = [...selectedItems]
      updatedItems[existingItemIndex].quantity = newQuantity
      setSelectedItems(updatedItems)
    } else {
      // Add new item
      setSelectedItems([...selectedItems, { item, quantity }])
    }

    // Reset selection
    setSelectedItemId("")
    setSelectedQuantity("1")

    // Update total
    calculateTotal([...selectedItems, { item, quantity }])
  }

  const removeItemFromTransaction = (index: number) => {
    const updatedItems = [...selectedItems]
    updatedItems.splice(index, 1)
    setSelectedItems(updatedItems)

    // Update total
    calculateTotal(updatedItems)
  }

  const calculateTotal = (items: { item: InventoryItem; quantity: number }[]) => {
    const total = items.reduce((sum, { item, quantity }) => {
      return sum + item.getPrice() * quantity
    }, 0)

    setTotalAmount(total)
  }

  // Update the createTransaction function
  const createTransaction = () => {
    setError("")

    if (selectedItems.length === 0) {
      setError("Please add at least one item to the transaction")
      return
    }

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

    try {
      // Create new transaction
      const transaction = new Transaction(customerName || "Walk-in Customer")

      // Add items to transaction
      for (const { item, quantity } of selectedItems) {
        transaction.addItem(item, quantity)
      }

      // Calculate total
      transaction.calculateTotal()

      // Add transaction to account
      account.addTransaction(transaction)

      // Refresh transactions immediately
      const updatedTransactions = account.getTransactions()
      setTransactions(updatedTransactions)
      setFilteredTransactions(updatedTransactions)

      // Show success message
      setSuccessMessage(`Transaction ${transaction.getTransactionId()} completed successfully!`)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

      // Reset form
      setCustomerName("")
      setSelectedItems([])
      setTotalAmount(0)

      // Close dialog
      setNewTransactionDialogOpen(false)
    } catch (err) {
      setError("An error occurred while creating the transaction")
    }
  }

  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailsDialogOpen(true)
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        >
          <h1 className="text-3xl font-bold text-green-800 mb-4 md:mb-0">Transaction Management</h1>
          <Button onClick={() => setNewTransactionDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> New Transaction
          </Button>
        </motion.div>

        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <Alert className="bg-green-50 border-green-200">
              <AlertCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success</AlertTitle>
              <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>View and manage your store's transactions</CardDescription>

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by ID or customer name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Date Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 Days</SelectItem>
                  <SelectItem value="month">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">ID</th>
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-right py-3 px-4">Items</th>
                    <th className="text-right py-3 px-4">Total</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction.getTransactionId()}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b"
                      >
                        <td className="py-3 px-4">{transaction.getTransactionId()}</td>
                        <td className="py-3 px-4">{new Date(transaction.getTransactionDate()).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-medium">{transaction.getCustomerName() || "Walk-in Customer"}</td>
                        <td className="py-3 px-4 text-right">{transaction.getItemsSold().length}</td>
                        <td className="py-3 px-4 text-right font-medium text-green-600">
                          ₱{transaction.getTotalAmount().toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="outline" size="sm" onClick={() => viewTransactionDetails(transaction)}>
                            View Details
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* New Transaction Dialog */}
        <Dialog open={newTransactionDialogOpen} onOpenChange={setNewTransactionDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Transaction</DialogTitle>
              <DialogDescription>Add items to the transaction and complete the sale.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer-name" className="text-right">
                  Customer Name
                </Label>
                <Input
                  id="customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">
                  Product
                </Label>
                <Select value={selectedItemId} onValueChange={setSelectedItemId} className="col-span-3">
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px] overflow-y-auto">
                    {inventory.map((item) => (
                      <SelectItem key={item.getProductId()} value={item.getProductId()} disabled={item.getStock() <= 0}>
                        {item.getProductName()} - ₱{item.getPrice().toFixed(2)} ({item.getStock()} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={selectedQuantity}
                    onChange={(e) => setSelectedQuantity(e.target.value)}
                  />
                  <Button
                    type="button"
                    onClick={addItemToTransaction}
                    className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
                  >
                    Add Item
                  </Button>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}

              <div className="col-span-4 mt-4">
                <h4 className="font-medium mb-2">Selected Items</h4>
                {selectedItems.length === 0 ? (
                  <p className="text-gray-500 text-sm">No items added yet</p>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedItems.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-md"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.item.getProductName()}</p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} x ₱{item.item.getPrice().toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-green-600 mr-2">
                          ₱{(item.quantity * item.item.getPrice()).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => removeItemFromTransaction(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              <div className="col-span-4 flex justify-between items-center pt-4 border-t">
                <div className="flex items-center">
                  <ShoppingCart className="mr-2 h-5 w-5 text-green-600" />
                  <span className="font-medium">Total:</span>
                </div>
                <span className="text-xl font-bold text-green-600">₱{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewTransactionDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={createTransaction}
                className="bg-green-600 hover:bg-green-700"
                disabled={selectedItems.length === 0}
              >
                Complete Transaction
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                {selectedTransaction && (
                  <>
                    Transaction {selectedTransaction.getTransactionId()} -{" "}
                    {new Date(selectedTransaction.getTransactionDate()).toLocaleDateString()}
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <div className="py-4">
                <div className="mb-4">
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="font-medium">{selectedTransaction.getCustomerName() || "Walk-in Customer"}</p>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Items</p>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {selectedTransaction.getItemsSold().map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <div>
                          <p className="font-medium">{item.getItem().getProductName()}</p>
                          <p className="text-sm text-gray-500">
                            {item.getQuantity()} x ₱{item.getItem().getPrice().toFixed(2)}
                          </p>
                        </div>
                        <p className="font-medium text-green-600">
                          ₱{(item.getQuantity() * item.getItem().getPrice()).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₱{selectedTransaction.getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
