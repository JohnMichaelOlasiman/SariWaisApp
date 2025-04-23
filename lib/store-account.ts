import { InventoryController } from "./inventory-controller"
import { Transaction } from "./transaction"
import type { Sales } from "./sales"

export interface SubscriptionInfo {
  status: "active" | "expired" | "trial"
  expiryDate: Date | null
}

export class StoreAccount {
  private username: string
  private password: string
  private storeName: string
  private storeAddress: string
  private contactNumber: string
  private inventoryController: InventoryController
  private transactions: Transaction[]
  private sales: Sales | null
  private subscription: SubscriptionInfo

  // Static list
  private static accountList: StoreAccount[] = []

  constructor(
    username: string,
    password: string,
    storeName: string,
    storeAddress: string,
    contactNumber: string,
    subscriptionStatus = "active",
    subscriptionExpiry: Date | null = null,
  ) {
    this.username = username
    this.password = password
    this.storeName = storeName
    this.storeAddress = storeAddress
    this.contactNumber = contactNumber
    this.inventoryController = new InventoryController()
    this.transactions = []
    this.sales = null
    this.subscription = {
      status: subscriptionStatus as "active" | "expired" | "trial",
      expiryDate: subscriptionExpiry,
    }
  }

  public getInventoryController(): InventoryController {
    return this.inventoryController
  }

  // Custom Methods
  public addTransaction(transaction: Transaction): void {
    this.transactions.push(transaction)
    console.log("Transaction " + transaction.getTransactionId() + " added successfully.")
  }

  public getTransactions(): Transaction[] {
    return this.transactions
  }

  public getSubscription(): SubscriptionInfo {
    return this.subscription
  }

  public setSubscription(status: "active" | "expired" | "trial", expiryDate: Date | null): void {
    this.subscription = { status, expiryDate }
  }

  public static findByUsername(username: string): StoreAccount | null {
    return this.findAccountByUsername(username)
  }

  public static login(username: string, password: string): boolean {
    const account = this.findAccountByUsername(username)
    if (account !== null && this.isPasswordCorrect(account, password)) {
      // Admin can always log in
      if (username === "admin") {
        console.log("Admin login successful")
        return true
      }

      // Check if subscription is active or trial
      if (account.subscription.status !== "expired") {
        console.log("Login successful for store: " + account.getStoreName())
        return true
      } else {
        console.log("Login failed. Subscription expired.")
        return false
      }
    }
    console.log("Login failed. Invalid credentials.")
    return false
  }

  public static logout(): void {
    console.log("Account logged out.")
  }

  // Admin methods
  public static createAccount(
    username: string,
    password: string,
    storeName: string,
    storeAddress: string,
    contactNumber: string,
    subscriptionStatus = "active",
    subscriptionExpiry: Date | null = null,
  ): boolean {
    if (this.isUsernameTaken(username)) {
      console.log("Account creation failed. Username already exists.")
      return false
    }

    const newAccount = new StoreAccount(
      username,
      password,
      storeName,
      storeAddress,
      contactNumber,
      subscriptionStatus,
      subscriptionExpiry,
    )

    this.accountList.push(newAccount)
    console.log("Account created successfully for store: " + storeName)
    return true
  }

  public static deleteAccount(username: string): boolean {
    if (username === "admin") {
      console.log("Cannot delete admin account.")
      return false
    }

    const initialLength = this.accountList.length
    this.accountList = this.accountList.filter((account) => account.username !== username)

    if (this.accountList.length < initialLength) {
      console.log("Account deleted successfully.")
      return true
    }

    console.log("Account deletion failed. Account not found.")
    return false
  }

  public static getAllAccounts(): any[] {
    return this.accountList.map((account) => ({
      username: account.username,
      storeName: account.storeName,
      storeAddress: account.storeAddress,
      contactNumber: account.contactNumber,
      subscriptionStatus: account.subscription.status,
      subscriptionExpiry: account.subscription.expiryDate,
    }))
  }

  public static resetPassword(username: string, newPassword: string): boolean {
    const account = this.findAccountByUsername(username)
    if (account !== null) {
      this.updateAccountPassword(account, newPassword)
      return true
    }
    console.log("Password reset failed. Account not found.")
    return false
  }

  // Private Methods
  private static findAccountByUsername(username: string): StoreAccount | null {
    const account = this.accountList.find((account) => account.getUsername() === username)
    return account || null
  }

  private static isPasswordCorrect(account: StoreAccount, password: string): boolean {
    return account.getPassword() === password
  }

  private static isUsernameTaken(username: string): boolean {
    return this.findAccountByUsername(username) !== null
  }

  private static updateAccountPassword(account: StoreAccount, newPassword: string): void {
    account.setPassword(newPassword)
    console.log("Password reset successful for store: " + account.getStoreName())
  }

  // Add this function to the StoreAccount class
  public static updateAccount(
    originalUsername: string,
    newUsername: string,
    newPassword: string | null,
    newStoreName: string,
    newStoreAddress: string,
    newContactNumber: string,
    newSubscriptionStatus: "active" | "expired" | "trial",
    newSubscriptionExpiry: Date | null,
  ): boolean {
    // Find the account
    const account = this.findAccountByUsername(originalUsername)
    if (!account) {
      console.log("Account update failed. Account not found.")
      return false
    }

    // If username is being changed, check if the new one is available
    if (originalUsername !== newUsername && this.isUsernameTaken(newUsername)) {
      console.log("Account update failed. New username already exists.")
      return false
    }

    // Update account details
    account.setUsername(newUsername)
    if (newPassword && newPassword.trim() !== "") {
      account.setPassword(newPassword)
    }
    account.setStoreName(newStoreName)
    account.setStoreAddress(newStoreAddress)
    account.setContactNumber(newContactNumber)
    account.setSubscription(newSubscriptionStatus, newSubscriptionExpiry)

    console.log("Account updated successfully for store: " + newStoreName)
    return true
  }

  // Hardcoded data
  public static preloadAccounts(): void {
    if (this.accountList.length > 0) {
      return // Only preload once
    }

    // Create admin account
    const admin = new StoreAccount("admin", "admin123", "Admin Store", "123 Admin St.", "123-456-7890")

    // Create a sample store account with active subscription
    const store1 = new StoreAccount(
      "store1",
      "password123",
      "Juan's Sari-Sari Store",
      "123 Main St., Manila",
      "0912-345-6789",
      "active",
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    )

    // Create a sample store account with trial subscription
    const store2 = new StoreAccount(
      "store2",
      "password123",
      "Maria's Mini Mart",
      "456 Second St., Cebu",
      "0923-456-7890",
      "trial",
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    )

    // Create a sample store account with expired subscription
    const store3 = new StoreAccount(
      "store3",
      "password123",
      "Pedro's Pantry",
      "789 Third St., Davao",
      "0934-567-8901",
      "expired",
      new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    )

    // Adding Filipino products to inventory for admin store
    const date = new Date(2023, 0, 1)
    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Bigas",
      stock: 100,
      purchasePrice: 38.0,
      price: 40.0,
      lowStockThreshold: 20,
      purchaseDate: date,
      category: "FOOD",
    }) // Rice

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Tuyo",
      stock: 50,
      purchasePrice: 9.0,
      price: 10.0,
      lowStockThreshold: 5,
      purchaseDate: date,
      category: "FOOD",
    }) // Dried fish

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Sardinas",
      stock: 80,
      purchasePrice: 20.0,
      price: 25.0,
      lowStockThreshold: 10,
      purchaseDate: date,
      category: "FOOD",
    }) // Canned sardines

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Sabon Panglaba",
      stock: 60,
      purchasePrice: 10.0,
      price: 15.0,
      lowStockThreshold: 10,
      purchaseDate: date,
      category: "TOILETRIES",
    }) // Laundry soap

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Toothpaste",
      stock: 40,
      purchasePrice: 45.0,
      price: 50.0,
      lowStockThreshold: 5,
      purchaseDate: date,
      category: "TOILETRIES",
    })

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Softdrinks",
      stock: 100,
      purchasePrice: 18.0,
      price: 20.0,
      lowStockThreshold: 10,
      purchaseDate: date,
      category: "BEVERAGES",
    }) // Soda

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Kape",
      stock: 75,
      purchasePrice: 10.0,
      price: 12.0,
      lowStockThreshold: 10,
      purchaseDate: date,
      category: "BEVERAGES",
    }) // Coffee

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Chicharon",
      stock: 30,
      purchasePrice: 20.0,
      price: 30.0,
      lowStockThreshold: 5,
      purchaseDate: date,
      category: "SNACKS",
    }) // Pork cracklings

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Yakult",
      stock: 50,
      purchasePrice: 6.0,
      price: 8.0,
      lowStockThreshold: 10,
      purchaseDate: date,
      category: "BEVERAGES",
    }) // Probiotic drink

    admin.getInventoryController().addInventoryItem({
      productId: null,
      productName: "Cooking Oil",
      stock: 20,
      purchasePrice: 55.5,
      price: 70.0,
      lowStockThreshold: 5,
      purchaseDate: date,
      category: "HOUSEHOLD",
    }) // Cooking oil

    // Transaction 1
    const date1 = new Date(2023, 0, 5)
    const transaction1 = new Transaction("Juan Dela Cruz", date1)
    transaction1.addItem(admin.getInventoryController().viewInventory()[0], 5) // 5 Bigas
    transaction1.addItem(admin.getInventoryController().viewInventory()[1], 10) // 10 Tuyo
    transaction1.calculateTotal()
    admin.addTransaction(transaction1)

    // Transaction 2
    const date2 = new Date(2023, 2, 15)
    const transaction2 = new Transaction("Maria Clara", date2)
    transaction2.addItem(admin.getInventoryController().viewInventory()[2], 3) // 3 Sardinas
    transaction2.addItem(admin.getInventoryController().viewInventory()[5], 2) // 2 Softdrinks
    transaction2.calculateTotal()
    admin.addTransaction(transaction2)

    // Transaction 3
    const date3 = new Date(2023, 5, 10)
    const transaction3 = new Transaction("Jose Rizal", date3)
    transaction3.addItem(admin.getInventoryController().viewInventory()[7], 4) // 4 Chicharon
    transaction3.addItem(admin.getInventoryController().viewInventory()[9], 1) // 1 Cooking Oil
    transaction3.calculateTotal()
    admin.addTransaction(transaction3)

    this.accountList.push(admin)
    this.accountList.push(store1)
    this.accountList.push(store2)
    this.accountList.push(store3)
  }

  // Getters and setters
  public getUsername(): string {
    return this.username
  }

  public setUsername(username: string): void {
    this.username = username
  }

  public getPassword(): string {
    return this.password
  }

  public setPassword(password: string): void {
    this.password = password
  }

  public getStoreName(): string {
    return this.storeName
  }

  public setStoreName(storeName: string): void {
    this.storeName = storeName
  }

  public getStoreAddress(): string {
    return this.storeAddress
  }

  public setStoreAddress(storeAddress: string): void {
    this.storeAddress = storeAddress
  }

  public getContactNumber(): string {
    return this.contactNumber
  }

  public setContactNumber(contactNumber: string): void {
    this.contactNumber = contactNumber
  }

  public getSales(): Sales | null {
    return this.sales
  }
}

// Export functions for easier access
export const findByUsername = (username: string): StoreAccount | null => {
  return StoreAccount.findByUsername(username)
}

export const login = (username: string, password: string): boolean => {
  return StoreAccount.login(username, password)
}

export const resetPassword = (username: string, newPassword: string): boolean => {
  return StoreAccount.resetPassword(username, newPassword)
}

export const preloadAccounts = (): void => {
  StoreAccount.preloadAccounts()
}

export const createAccount = (
  username: string,
  password: string,
  storeName: string,
  storeAddress: string,
  contactNumber: string,
  subscriptionStatus = "active",
  subscriptionExpiry: Date | null = null,
): boolean => {
  return StoreAccount.createAccount(
    username,
    password,
    storeName,
    storeAddress,
    contactNumber,
    subscriptionStatus,
    subscriptionExpiry,
  )
}

export const deleteAccount = (username: string): boolean => {
  return StoreAccount.deleteAccount(username)
}

export const getAllAccounts = (): any[] => {
  return StoreAccount.getAllAccounts()
}

// Add this to the exported functions at the bottom of the file
export const updateAccount = (
  originalUsername: string,
  newUsername: string,
  newPassword: string | null,
  newStoreName: string,
  newStoreAddress: string,
  newContactNumber: string,
  newSubscriptionStatus: "active" | "expired" | "trial",
  newSubscriptionExpiry: Date | null,
): boolean => {
  return StoreAccount.updateAccount(
    originalUsername,
    newUsername,
    newPassword,
    newStoreName,
    newStoreAddress,
    newContactNumber,
    newSubscriptionStatus,
    newSubscriptionExpiry,
  )
}
