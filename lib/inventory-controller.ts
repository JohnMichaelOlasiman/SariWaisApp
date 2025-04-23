import { InventoryItem } from "./inventory-item"

export class InventoryController {
  private inventory: InventoryItem[]
  private itemCounter: number

  constructor() {
    this.inventory = []
    this.itemCounter = 1
  }

  // Custom Methods
  public addInventoryItem(item: InventoryItem | any): void {
    // If item is a plain object, convert it to an InventoryItem
    const inventoryItem =
      item instanceof InventoryItem
        ? item
        : new InventoryItem(
            item.productId,
            item.productName,
            item.stock,
            item.purchasePrice,
            item.price,
            item.lowStockThreshold,
            item.purchaseDate,
            item.category,
          )

    inventoryItem.setProductId("P" + this.itemCounter++) // Assign ID using the store's counter
    this.inventory.push(inventoryItem)
  }

  public updateStock(productId: string, quantity: number): boolean {
    const item = this.findInventoryItemById(productId)
    if (item !== null) {
      if (quantity >= 0) {
        item.addStock(quantity)
        console.log("Added " + quantity + " units to " + item.getProductName() + ".")
      } else {
        const success = item.removeStock(-quantity)
        if (success) {
          console.log("Removed " + -quantity + " units from " + item.getProductName() + ".")
        } else {
          console.log("Failed to remove " + -quantity + " units from " + item.getProductName() + ".")
        }
        return success
      }
      return true
    }
    console.log("Error: Product with ID " + productId + " not found.")
    return false
  }

  public deleteInventoryItem(productId: string): boolean {
    const item = this.findInventoryItemById(productId)
    if (item !== null) {
      this.inventory = this.inventory.filter((i) => i.getProductId() !== productId)
      console.log("Deleted product: " + item.getProductName() + " (ID: " + productId + ").")
      return true
    }
    console.log("Error: Product with ID " + productId + " not found.")
    return false
  }

  public viewInventory(): InventoryItem[] {
    return [...this.inventory]
  }

  public checkLowStock(): InventoryItem[] {
    return this.inventory.filter((item) => item.isLowStock())
  }

  // Private Methods
  private findInventoryItemById(productId: string): InventoryItem | null {
    const item = this.inventory.find((item) => item.getProductId() === productId)
    return item || null
  }
}
