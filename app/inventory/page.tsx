"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { findByUsername } from "@/lib/store-account"
import { InventoryItem, Category, addCustomCategory, getAllCategories } from "@/lib/inventory-item"
import DashboardLayout from "@/components/dashboard-layout"
import { Search, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"

export default function Inventory() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [filteredInventory, setFilteredInventory] = useState<InventoryItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])

  // New item form state
  const [newItemName, setNewItemName] = useState("")
  const [newItemStock, setNewItemStock] = useState("")
  const [newItemPurchasePrice, setNewItemPurchasePrice] = useState("")
  const [newItemPrice, setNewItemPrice] = useState("")
  const [newItemThreshold, setNewItemThreshold] = useState("")
  const [newItemCategory, setNewItemCategory] = useState<string>(Category.FOOD)

  // Edit item form state
  const [editItemId, setEditItemId] = useState<string | null>(null)
  const [editItemName, setEditItemName] = useState("")
  const [editItemStock, setEditItemStock] = useState("")
  const [editItemPurchasePrice, setEditItemPurchasePrice] = useState("")
  const [editItemPrice, setEditItemPrice] = useState("")
  const [editItemThreshold, setEditItemThreshold] = useState("")
  const [editItemCategory, setEditItemCategory] = useState<string>(Category.FOOD)

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)

  // Update stock dialog
  const [updateStockDialogOpen, setUpdateStockDialogOpen] = useState(false)
  const [updateItemId, setUpdateItemId] = useState<string | null>(null)
  const [updateItemName, setUpdateItemName] = useState("")
  const [updateQuantity, setUpdateQuantity] = useState("")

  // Error state
  const [error, setError] = useState("")

  const [categories, setCategories] = useState<string[]>([])
  const [newCategoryDialogOpen, setNewCategoryDialogOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")

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

    // Get inventory
    const inventoryItems = account.getInventoryController().viewInventory()
    setInventory(inventoryItems)
    setFilteredInventory(inventoryItems)

    // Get low stock items
    const lowStock = account.getInventoryController().checkLowStock()
    setLowStockItems(lowStock)
  }, [router])

  useEffect(() => {
    // Filter inventory based on search term and category
    let filtered = inventory

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.getProductName().toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.getProductId().toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter((item) => item.getCategory() === categoryFilter)
    }

    setFilteredInventory(filtered)
  }, [searchTerm, categoryFilter, inventory])

  useEffect(() => {
    setCategories(getAllCategories())
  }, [])

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      setError("Category name cannot be empty")
      return
    }

    const formattedCategory = newCategoryName.toUpperCase().replace(/\s+/g, "_")
    addCustomCategory(formattedCategory)
    setCategories(getAllCategories())
    setNewCategoryName("")
    setNewCategoryDialogOpen(false)
  }

  const handleAddItem = () => {
    setError("")

    if (!newItemName || !newItemStock || !newItemPurchasePrice || !newItemPrice || !newItemThreshold) {
      setError("All fields are required")
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
      const stock = Number.parseInt(newItemStock)
      const purchasePrice = Number.parseFloat(newItemPurchasePrice)
      const price = Number.parseFloat(newItemPrice)
      const threshold = Number.parseInt(newItemThreshold)

      if (isNaN(stock) || isNaN(purchasePrice) || isNaN(price) || isNaN(threshold)) {
        setError("Invalid number format")
        return
      }

      if (stock < 0 || purchasePrice < 0 || price < 0 || threshold < 0) {
        setError("Values cannot be negative")
        return
      }

      const newItem = new InventoryItem(
        null,
        newItemName,
        stock,
        purchasePrice,
        price,
        threshold,
        new Date(),
        newItemCategory as Category,
      )

      account.getInventoryController().addInventoryItem(newItem)

      // Refresh inventory
      const updatedInventory = account.getInventoryController().viewInventory()
      setInventory(updatedInventory)

      // Reset form
      setNewItemName("")
      setNewItemStock("")
      setNewItemPurchasePrice("")
      setNewItemPrice("")
      setNewItemThreshold("")
      setNewItemCategory(Category.FOOD)

      // Close dialog
      setAddDialogOpen(false)
    } catch (err) {
      setError("An error occurred while adding the item")
    }
  }

  const handleEditItem = () => {
    setError("")

    if (!editItemName || !editItemStock || !editItemPurchasePrice || !editItemPrice || !editItemThreshold) {
      setError("All fields are required")
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
      const stock = Number.parseInt(editItemStock)
      const purchasePrice = Number.parseFloat(editItemPurchasePrice)
      const price = Number.parseFloat(editItemPrice)
      const threshold = Number.parseInt(editItemThreshold)

      if (isNaN(stock) || isNaN(purchasePrice) || isNaN(price) || isNaN(threshold)) {
        setError("Invalid number format")
        return
      }

      if (stock < 0 || purchasePrice < 0 || price < 0 || threshold < 0) {
        setError("Values cannot be negative")
        return
      }

      // Find the item to edit
      const itemToEdit = inventory.find((item) => item.getProductId() === editItemId)
      if (!itemToEdit) {
        setError("Item not found")
        return
      }

      // Update item properties
      itemToEdit.setProductName(editItemName)
      itemToEdit.setStock(stock)
      itemToEdit.setPurchasePrice(purchasePrice)
      itemToEdit.setPrice(price)
      itemToEdit.setLowStockThreshold(threshold)
      itemToEdit.setCategory(editItemCategory as Category)

      // Refresh inventory
      setInventory([...inventory])

      // Close dialog
      setEditDialogOpen(false)
    } catch (err) {
      setError("An error occurred while editing the item")
    }
  }

  const handleDeleteItem = () => {
    if (!deleteItemId) return

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
      account.getInventoryController().deleteInventoryItem(deleteItemId)

      // Refresh inventory
      const updatedInventory = account.getInventoryController().viewInventory()
      setInventory(updatedInventory)

      // Close dialog
      setDeleteDialogOpen(false)
    } catch (err) {
      setError("An error occurred while deleting the item")
    }
  }

  const handleUpdateStock = () => {
    setError("")

    if (!updateQuantity) {
      setError("Quantity is required")
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
      const quantity = Number.parseInt(updateQuantity)

      if (isNaN(quantity)) {
        setError("Invalid number format")
        return
      }

      if (updateItemId) {
        account.getInventoryController().updateStock(updateItemId, quantity)

        // Refresh inventory
        const updatedInventory = account.getInventoryController().viewInventory()
        setInventory(updatedInventory)

        // Refresh low stock items
        const lowStock = account.getInventoryController().checkLowStock()
        setLowStockItems(lowStock)

        // Close dialog
        setUpdateStockDialogOpen(false)
      }
    } catch (err) {
      setError("An error occurred while updating stock")
    }
  }

  const openEditDialog = (item: InventoryItem) => {
    setEditItemId(item.getProductId())
    setEditItemName(item.getProductName())
    setEditItemStock(item.getStock().toString())
    setEditItemPurchasePrice(item.getPurchasePrice().toString())
    setEditItemPrice(item.getPrice().toString())
    setEditItemThreshold(item.getLowStockThreshold().toString())
    setEditItemCategory(item.getCategory())
    setEditDialogOpen(true)
  }

  const openUpdateStockDialog = (item: InventoryItem) => {
    setUpdateItemId(item.getProductId())
    setUpdateItemName(item.getProductName())
    setUpdateQuantity("")
    setUpdateStockDialogOpen(true)
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
          <h1 className="text-3xl font-bold text-green-800 mb-4 md:mb-0">Inventory Management</h1>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </motion.div>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>Manage your store's inventory</CardDescription>

                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by name or ID..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Categories</SelectItem>
                      <SelectItem value={Category.FOOD}>Food</SelectItem>
                      <SelectItem value={Category.BEVERAGES}>Beverages</SelectItem>
                      <SelectItem value={Category.HOUSEHOLD}>Household</SelectItem>
                      <SelectItem value={Category.SNACKS}>Snacks</SelectItem>
                      <SelectItem value={Category.TOILETRIES}>Toiletries</SelectItem>
                      <SelectItem value={Category.OTHER}>Other</SelectItem>
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
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-right py-3 px-4">Stock</th>
                        <th className="text-right py-3 px-4">Purchase Price</th>
                        <th className="text-right py-3 px-4">Selling Price</th>
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-4 text-gray-500">
                            No items found
                          </td>
                        </tr>
                      ) : (
                        filteredInventory.map((item, index) => (
                          <motion.tr
                            key={item.getProductId()}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className={`border-b ${item.isLowStock() ? "bg-red-50" : ""}`}
                          >
                            <td className="py-3 px-4">{item.getProductId()}</td>
                            <td className="py-3 px-4 font-medium">{item.getProductName()}</td>
                            <td className="py-3 px-4">{item.getCategory()}</td>
                            <td
                              className={`py-3 px-4 text-right ${item.isLowStock() ? "text-red-600 font-medium" : ""}`}
                            >
                              {item.getStock()}
                              {item.isLowStock() && <AlertTriangle className="inline ml-2 h-4 w-4 text-red-600" />}
                            </td>
                            <td className="py-3 px-4 text-right">₱{item.getPurchasePrice().toFixed(2)}</td>
                            <td className="py-3 px-4 text-right">₱{item.getPrice().toFixed(2)}</td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex justify-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => openUpdateStockDialog(item)}>
                                  Update Stock
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => openEditDialog(item)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-red-600"
                                  onClick={() => {
                                    setDeleteItemId(item.getProductId())
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
          </TabsContent>

          <TabsContent value="low-stock">
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Items</CardTitle>
                <CardDescription>Items that need to be restocked</CardDescription>
              </CardHeader>
              <CardContent>
                {lowStockItems.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">No items are low in stock</p>
                ) : (
                  <div className="space-y-4">
                    {lowStockItems.map((item, index) => (
                      <motion.div
                        key={item.getProductId()}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex justify-between items-center p-4 bg-red-50 rounded-lg border border-red-100"
                      >
                        <div>
                          <p className="font-medium">{item.getProductName()}</p>
                          <p className="text-sm text-gray-500">
                            ID: {item.getProductId()} | Category: {item.getCategory()}
                          </p>
                          <p className="text-sm text-red-600 font-medium">
                            Current stock: {item.getStock()} / Threshold: {item.getLowStockThreshold()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => openUpdateStockDialog(item)}
                        >
                          Restock
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add Item Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Inventory Item</DialogTitle>
              <DialogDescription>Enter the details of the new product to add to your inventory.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="stock"
                  type="number"
                  value={newItemStock}
                  onChange={(e) => setNewItemStock(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="purchase-price" className="text-right">
                  Purchase Price
                </Label>
                <Input
                  id="purchase-price"
                  type="number"
                  step="0.01"
                  value={newItemPurchasePrice}
                  onChange={(e) => setNewItemPurchasePrice(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">
                  Selling Price
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="threshold" className="text-right">
                  Low Stock Threshold
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  value={newItemThreshold}
                  onChange={(e) => setNewItemThreshold(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Select value={newItemCategory} onValueChange={setNewItemCategory} className="flex-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setNewCategoryDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem} className="bg-green-600 hover:bg-green-700">
                Add Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Item Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>Update the details of the selected product.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editItemName}
                  onChange={(e) => setEditItemName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-stock" className="text-right">
                  Stock
                </Label>
                <Input
                  id="edit-stock"
                  type="number"
                  value={editItemStock}
                  onChange={(e) => setEditItemStock(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-purchase-price" className="text-right">
                  Purchase Price
                </Label>
                <Input
                  id="edit-purchase-price"
                  type="number"
                  step="0.01"
                  value={editItemPurchasePrice}
                  onChange={(e) => setEditItemPurchasePrice(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-price" className="text-right">
                  Selling Price
                </Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editItemPrice}
                  onChange={(e) => setEditItemPrice(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-threshold" className="text-right">
                  Low Stock Threshold
                </Label>
                <Input
                  id="edit-threshold"
                  type="number"
                  value={editItemThreshold}
                  onChange={(e) => setEditItemThreshold(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-category" className="text-right">
                  Category
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Select value={editItemCategory} onValueChange={setEditItemCategory} className="flex-1">
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="icon" onClick={() => setNewCategoryDialogOpen(true)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditItem} className="bg-green-600 hover:bg-green-700">
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
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Update Stock Dialog */}
        <Dialog open={updateStockDialogOpen} onOpenChange={setUpdateStockDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Stock</DialogTitle>
              <DialogDescription>
                Update the stock quantity for {updateItemName}. Use positive values to add stock, negative values to
                remove.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={updateQuantity}
                  onChange={(e) => setUpdateQuantity(e.target.value)}
                  className="col-span-3"
                  placeholder="Enter quantity (e.g. 10, -5)"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUpdateStockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStock} className="bg-green-600 hover:bg-green-700">
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add new category Dialog */}
        <Dialog open={newCategoryDialogOpen} onOpenChange={setNewCategoryDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>Create a custom category for your inventory items.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-category" className="text-right">
                  Category Name
                </Label>
                <Input
                  id="new-category"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. ELECTRONICS"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewCategoryDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} className="bg-green-600 hover:bg-green-700">
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
