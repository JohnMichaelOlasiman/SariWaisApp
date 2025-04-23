"use client"

import { useState, useEffect } from "react"
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
import { motion } from "framer-motion"
import { getAllAccounts, createAccount, deleteAccount, updateAccount } from "@/lib/store-account"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPanel() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<any[]>([])
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // New account form state
  const [newAccountDialogOpen, setNewAccountDialogOpen] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [storeName, setStoreName] = useState("")
  const [storeAddress, setStoreAddress] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("active")
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string>("")
  const [error, setError] = useState("")

  // Edit account form state
  const [editAccountDialogOpen, setEditAccountDialogOpen] = useState(false)
  const [editUsername, setEditUsername] = useState("")
  const [editPassword, setEditPassword] = useState("")
  const [editStoreName, setEditStoreName] = useState("")
  const [editStoreAddress, setEditStoreAddress] = useState("")
  const [editContactNumber, setEditContactNumber] = useState("")
  const [editSubscriptionStatus, setEditSubscriptionStatus] = useState<string>("active")
  const [editSubscriptionExpiry, setEditSubscriptionExpiry] = useState<string>("")
  const [originalUsername, setOriginalUsername] = useState("")

  // Success message
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<string>("")

  useEffect(() => {
    // Check if user is admin
    const username = localStorage.getItem("currentUser")
    if (username !== "admin") {
      router.push("/dashboard")
      return
    }

    // Load all accounts
    const allAccounts = getAllAccounts()
    setAccounts(allAccounts)
    setFilteredAccounts(allAccounts)
  }, [router])

  useEffect(() => {
    // Filter accounts based on search term and status
    let filtered = accounts

    if (searchTerm) {
      filtered = filtered.filter(
        (account) =>
          account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.storeName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((account) => account.subscriptionStatus === statusFilter)
    }

    setFilteredAccounts(filtered)
  }, [searchTerm, statusFilter, accounts])

  const handleCreateAccount = () => {
    setError("")

    if (!username || !password || !storeName || !storeAddress || !contactNumber) {
      setError("All fields are required")
      return
    }

    try {
      // Create new account
      const result = createAccount(
        username,
        password,
        storeName,
        storeAddress,
        contactNumber,
        subscriptionStatus,
        subscriptionExpiry ? new Date(subscriptionExpiry) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      )

      if (result) {
        // Refresh accounts list
        const updatedAccounts = getAllAccounts()
        setAccounts(updatedAccounts)

        // Show success message
        setSuccessMessage(`Account for ${storeName} created successfully!`)
        setShowSuccess(true)

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)

        // Reset form
        setUsername("")
        setPassword("")
        setStoreName("")
        setStoreAddress("")
        setContactNumber("")
        setSubscriptionStatus("active")
        setSubscriptionExpiry("")

        // Close dialog
        setNewAccountDialogOpen(false)
      } else {
        setError("Username already exists")
      }
    } catch (err) {
      setError("An error occurred while creating the account")
    }
  }

  const handleEditAccount = () => {
    setError("")

    if (!editStoreName || !editStoreAddress || !editContactNumber) {
      setError("Store name, address, and contact number are required")
      return
    }

    try {
      // Update account
      const result = updateAccount(
        originalUsername,
        editUsername,
        editPassword,
        editStoreName,
        editStoreAddress,
        editContactNumber,
        editSubscriptionStatus as "active" | "expired" | "trial",
        editSubscriptionExpiry ? new Date(editSubscriptionExpiry) : null,
      )

      if (result) {
        // Refresh accounts list
        const updatedAccounts = getAllAccounts()
        setAccounts(updatedAccounts)

        // Show success message
        setSuccessMessage(`Account for ${editStoreName} updated successfully!`)
        setShowSuccess(true)

        // Hide success message after 3 seconds
        setTimeout(() => {
          setShowSuccess(false)
        }, 3000)

        // Close dialog
        setEditAccountDialogOpen(false)
      } else {
        setError("Failed to update account. Username may already exist.")
      }
    } catch (err) {
      setError("An error occurred while updating the account")
    }
  }

  const handleDeleteAccount = () => {
    if (!accountToDelete) return

    try {
      // Delete account
      deleteAccount(accountToDelete)

      // Refresh accounts list
      const updatedAccounts = getAllAccounts()
      setAccounts(updatedAccounts)

      // Show success message
      setSuccessMessage(`Account deleted successfully!`)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)

      // Close dialog
      setDeleteDialogOpen(false)
    } catch (err) {
      setError("An error occurred while deleting the account")
    }
  }

  const openEditDialog = (account: any) => {
    setOriginalUsername(account.username)
    setEditUsername(account.username)
    setEditPassword("")
    setEditStoreName(account.storeName)
    setEditStoreAddress(account.storeAddress)
    setEditContactNumber(account.contactNumber)
    setEditSubscriptionStatus(account.subscriptionStatus)

    if (account.subscriptionExpiry) {
      const date = new Date(account.subscriptionExpiry)
      const formattedDate = date.toISOString().split("T")[0]
      setEditSubscriptionExpiry(formattedDate)
    } else {
      setEditSubscriptionExpiry("")
    }

    setEditAccountDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-green-800">SariWais Admin</h1>
          </div>
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem("currentUser")
                router.push("/")
              }}
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6"
        >
          <h1 className="text-3xl font-bold text-green-800 mb-4 md:mb-0">Store Account Management</h1>
          <Button onClick={() => setNewAccountDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Create New Account
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
            <CardTitle>Store Accounts</CardTitle>
            <CardDescription>Manage store accounts and subscriptions</CardDescription>

            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search by username or store name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Status Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Username</th>
                    <th className="text-left py-3 px-4">Store Name</th>
                    <th className="text-left py-3 px-4">Address</th>
                    <th className="text-left py-3 px-4">Contact</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Expiry Date</th>
                    <th className="text-center py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">
                        No accounts found
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map((account, index) => (
                      <motion.tr
                        key={account.username}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b"
                      >
                        <td className="py-3 px-4 font-medium">{account.username}</td>
                        <td className="py-3 px-4">{account.storeName}</td>
                        <td className="py-3 px-4">{account.storeAddress}</td>
                        <td className="py-3 px-4">{account.contactNumber}</td>
                        <td className="py-3 px-4">
                          <Badge
                            className={
                              account.subscriptionStatus === "active"
                                ? "bg-green-100 text-green-800"
                                : account.subscriptionStatus === "trial"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {account.subscriptionStatus}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {account.subscriptionExpiry
                            ? new Date(account.subscriptionExpiry).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex justify-center space-x-2">
                            <Button variant="outline" size="icon" onClick={() => openEditDialog(account)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600"
                              onClick={() => {
                                setAccountToDelete(account.username)
                                setDeleteDialogOpen(true)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Account Dialog */}
        <Dialog open={newAccountDialogOpen} onOpenChange={setNewAccountDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Store Account</DialogTitle>
              <DialogDescription>Enter the details for the new store account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="store-name" className="text-right">
                  Store Name
                </Label>
                <Input
                  id="store-name"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="store-address" className="text-right">
                  Store Address
                </Label>
                <Input
                  id="store-address"
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="contact-number" className="text-right">
                  Contact Number
                </Label>
                <Input
                  id="contact-number"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscription-status" className="text-right">
                  Status
                </Label>
                <Select value={subscriptionStatus} onValueChange={setSubscriptionStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="subscription-expiry" className="text-right">
                  Expiry Date
                </Label>
                <Input
                  id="subscription-expiry"
                  type="date"
                  value={subscriptionExpiry}
                  onChange={(e) => setSubscriptionExpiry(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewAccountDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAccount} className="bg-green-600 hover:bg-green-700">
                Create Account
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Account Dialog */}
        <Dialog open={editAccountDialogOpen} onOpenChange={setEditAccountDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Store Account</DialogTitle>
              <DialogDescription>Update the details for this store account.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-username" className="text-right">
                  Username
                </Label>
                <Input
                  id="edit-username"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-password" className="text-right">
                  Password
                </Label>
                <Input
                  id="edit-password"
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-store-name" className="text-right">
                  Store Name
                </Label>
                <Input
                  id="edit-store-name"
                  value={editStoreName}
                  onChange={(e) => setEditStoreName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-store-address" className="text-right">
                  Store Address
                </Label>
                <Input
                  id="edit-store-address"
                  value={editStoreAddress}
                  onChange={(e) => setEditStoreAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-contact-number" className="text-right">
                  Contact Number
                </Label>
                <Input
                  id="edit-contact-number"
                  value={editContactNumber}
                  onChange={(e) => setEditContactNumber(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subscription-status" className="text-right">
                  Status
                </Label>
                <Select value={editSubscriptionStatus} onValueChange={setEditSubscriptionStatus}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-subscription-expiry" className="text-right">
                  Expiry Date
                </Label>
                <Input
                  id="edit-subscription-expiry"
                  type="date"
                  value={editSubscriptionExpiry}
                  onChange={(e) => setEditSubscriptionExpiry(e.target.value)}
                  className="col-span-3"
                />
              </div>
              {error && <p className="text-red-500 text-sm col-span-4 text-center">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditAccountDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditAccount} className="bg-green-600 hover:bg-green-700">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this account? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteAccount}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
