import type { Transaction } from "./transaction"
import type { InventoryItem } from "./inventory-item"
import type { StoreAccount } from "./store-account"

export class Sales {
  private transactions: Transaction[]
  private account: StoreAccount

  constructor(transactions: Transaction[], account: StoreAccount) {
    this.transactions = transactions
    this.account = account
  }

  public getTopSellingProducts(topN: number, start: Date, end: Date): InventoryItem[] {
    const salesCount: Map<InventoryItem, number> = new Map()

    for (const transaction of this.transactions) {
      // Filter transactions based on date range
      const transactionDate = transaction.getTransactionDate()
      if (transactionDate >= start && transactionDate <= end) {
        // Iterate over items sold in the transaction
        for (const item of transaction.getItemsSold()) {
          const currentItem = item.getItem()
          const currentCount = salesCount.get(currentItem) || 0
          salesCount.set(currentItem, currentCount + item.getQuantity())
        }
      }
    }

    // Sort by sales count in descending order and return topN products
    return Array.from(salesCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map((entry) => entry[0])
  }

  // Method for least selling products
  public getLeastSellingProducts(topN: number, start: Date, end: Date): InventoryItem[] {
    const salesCount: Map<InventoryItem, number> = new Map()

    // Checks based on Transactions
    for (const transaction of this.transactions) {
      // Filter transactions based on date range
      const transactionDate = transaction.getTransactionDate()
      if (transactionDate >= start && transactionDate <= end) {
        // Iterate over items sold in the transaction
        for (const item of transaction.getItemsSold()) {
          const currentItem = item.getItem()
          const currentCount = salesCount.get(currentItem) || 0
          salesCount.set(currentItem, currentCount + item.getQuantity())
        }
      }
    }

    // Sort by sales count in ascending order and return topN products
    return Array.from(salesCount.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, topN)
      .map((entry) => entry[0])
  }

  public getTotalRevenue(start: Date, end: Date): number {
    return this.transactions
      .filter((t) => {
        const transactionDate = t.getTransactionDate()
        return transactionDate >= start && transactionDate <= end
      })
      .reduce((sum, t) => sum + t.getTotalAmount(), 0)
  }

  public getTotalTransactions(start: Date, end: Date): number {
    return this.transactions.filter((t) => {
      const transactionDate = t.getTransactionDate()
      return transactionDate >= start && transactionDate <= end
    }).length
  }

  // NOTE: We subdivided expenses into Costs of Goods Sold (COGS)
  // and COGP (COGP)
  // COGS refers to the cost of the goods being sold
  // COGP refers to the cost of the total goods being purchased at a specific timeframe

  // Cost of Goods Sold
  public getCOGS(start: Date, end: Date): number {
    return this.transactions
      .filter((t) => {
        const transactionDate = t.getTransactionDate()
        return transactionDate >= start && transactionDate <= end
      })
      .flatMap((t) => t.getItemsSold())
      .reduce((sum, item) => sum + item.getQuantity() * item.getItem().getPurchasePrice(), 0)
  }

  public getDailyAverageRevenue(start: Date, end: Date): number {
    const totalRevenue = this.getTotalRevenue(start, end)
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1 // Inclusive
    const average = days > 0 ? totalRevenue / days : 0.0
    return Math.round(average * 100) / 100 // Round to 2 decimal places
  }

  // Cost of Goods Purchased
  public getCOGP(start: Date, end: Date): number {
    let sum = 0
    // Iterate through inventory items
    for (const item of this.account.getInventoryController().viewInventory()) {
      // Check if the item's purchase date falls within the specified range
      const purchaseDate = item.getPurchaseDate()
      if (purchaseDate >= start && purchaseDate <= end) {
        sum += item.getPurchasePrice() * item.getStock()
      }
    }
    return sum + this.getCOGS(start, end)
  }

  public getTotalProfit(start: Date, end: Date): number {
    const revenue = this.getTotalRevenue(start, end)
    const cogs = this.getCOGS(start, end)
    return revenue - cogs
  }

  public generateSalesReport(start: Date, end: Date): string {
    let report = "Sales Report\n"
    report += "From: " + start.toISOString().split("T")[0] + " To: " + end.toISOString().split("T")[0] + "\n"
    report += "Timestamp: " + new Date().toISOString().split("T")[0] + "\n"
    report += "Total Revenue: PHP" + this.getTotalRevenue(start, end).toFixed(2) + "\n"
    report += "Daily Average Revenue: PHP" + this.getDailyAverageRevenue(start, end).toFixed(2) + "\n"
    report += "Total Profit: PHP" + this.getTotalProfit(start, end).toFixed(2) + "\n"
    report += "Total Transactions: " + this.getTotalTransactions(start, end) + "\n"

    report += "Top Selling Products:\n"
    for (const item of this.getTopSellingProducts(5, start, end)) {
      report += "- " + item.getProductName() + "\n"
    }
    report += "Least Selling Products:\n"
    for (const item of this.getLeastSellingProducts(5, start, end)) {
      report += "- " + item.getProductName() + "\n"
    }

    return report
  }

  public generateExpensesReport(start: Date, end: Date): string {
    let report = "Expenses Report\n"
    report += "From: " + start.toISOString().split("T")[0] + " To: " + end.toISOString().split("T")[0] + "\n"
    report += "Timestamp: " + new Date().toISOString().split("T")[0] + "\n"
    report += "Total COGS: PHP" + this.getCOGS(start, end).toFixed(2) + "\n"
    report += "Total COGP: PHP" + this.getCOGP(start, end).toFixed(2) + "\n"

    return report
  }
}
