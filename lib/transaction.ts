import type { InventoryItem } from "./inventory-item"

export class TransactionItem {
  private item: InventoryItem
  private quantity: number

  constructor(item: InventoryItem, quantity: number) {
    this.item = item
    this.quantity = quantity
  }

  public getItem(): InventoryItem {
    return this.item
  }

  public getQuantity(): number {
    return this.quantity
  }
}

export class Transaction {
  private transactionId: string
  private transactionDate: Date
  private itemsSold: TransactionItem[]
  private totalAmount: number
  private customerName: string
  private static transactionCounter = 1

  // Default constructor with current date
  constructor(customerName: string, transactionDate?: Date) {
    this.transactionId = this.generateTransactionId()
    this.transactionDate = transactionDate || new Date()
    this.itemsSold = []
    this.totalAmount = 0.0
    this.customerName = customerName
  }

  private generateTransactionId(): string {
    return "T" + Transaction.transactionCounter++
  }

  // Custom Methods
  public addItem(item: InventoryItem, quantity: number): void {
    if (item.getStock() >= quantity) {
      this.itemsSold.push(new TransactionItem(item, quantity))
      item.removeStock(quantity)
      console.log("Added " + quantity + " of " + item.getProductName() + " to the transaction.")
    } else {
      console.log("Insufficient stock for item: " + item.getProductName())
    }
  }

  public calculateTotal(): void {
    this.totalAmount = 0
    for (const transactionItem of this.itemsSold) {
      this.totalAmount += transactionItem.getItem().getPrice() * transactionItem.getQuantity()
    }
  }

  // Getters and setters
  public getTransactionId(): string {
    return this.transactionId
  }

  public getTransactionDate(): Date {
    return this.transactionDate
  }

  public getItemsSold(): TransactionItem[] {
    return this.itemsSold
  }

  public getTotalAmount(): number {
    return this.totalAmount
  }

  public getCustomerName(): string {
    return this.customerName
  }

  public setCustomerName(customerName: string): void {
    this.customerName = customerName
  }

  public getTotalTransactions(): number {
    return Transaction.transactionCounter
  }
}
