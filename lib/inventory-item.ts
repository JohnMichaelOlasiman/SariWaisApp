export enum Category {
  FOOD = "FOOD",
  BEVERAGES = "BEVERAGES",
  HOUSEHOLD = "HOUSEHOLD",
  SNACKS = "SNACKS",
  TOILETRIES = "TOILETRIES",
  OTHER = "OTHER",
  // Custom categories will be added dynamically
}

// Add this function to manage custom categories
export const customCategories: string[] = []

export function addCustomCategory(category: string): void {
  if (!Object.values(Category).includes(category as Category) && !customCategories.includes(category)) {
    customCategories.push(category)
  }
}

export function getAllCategories(): string[] {
  return [...Object.values(Category), ...customCategories]
}

export class InventoryItem {
  private productId: string | null
  private productName: string
  private stock: number
  private price: number
  private purchasePrice: number
  private purchaseDate: Date
  private lowStockThreshold: number
  private category: Category | string

  constructor(
    productId: string | null,
    productName: string,
    stock: number,
    purchasePrice: number,
    price: number,
    lowStockThreshold: number,
    purchaseDate: Date,
    category: Category | string,
  ) {
    this.productId = productId
    this.productName = productName
    this.stock = stock
    this.price = price
    this.lowStockThreshold = lowStockThreshold
    this.category = category
    this.purchasePrice = purchasePrice
    this.purchaseDate = purchaseDate
  }

  // Custom Methods
  public addStock(quantity: number): void {
    this.stock += quantity
  }

  public removeStock(quantity: number): boolean {
    if (this.stock >= quantity) {
      this.stock -= quantity
      return true
    }
    console.log("Error: Insufficient stock to remove " + quantity + " units of " + this.productName + ".")
    return false
  }

  public isLowStock(): boolean {
    return this.stock < this.lowStockThreshold
  }

  // Getters and setters
  public getProductId(): string {
    return this.productId || ""
  }

  public setProductId(productId: string): void {
    this.productId = productId
  }

  public getProductName(): string {
    return this.productName
  }

  public setProductName(productName: string): void {
    this.productName = productName
  }

  public getStock(): number {
    return this.stock
  }

  public setStock(stock: number): void {
    this.stock = stock
  }

  public getPrice(): number {
    return this.price
  }

  public setPrice(price: number): void {
    this.price = price
  }

  public getPurchasePrice(): number {
    return this.purchasePrice
  }

  public setPurchasePrice(purchasePrice: number): void {
    this.purchasePrice = purchasePrice
  }

  public getPurchaseDate(): Date {
    return this.purchaseDate
  }

  public setPurchaseDate(purchaseDate: Date): void {
    this.purchaseDate = purchaseDate
  }

  public getLowStockThreshold(): number {
    return this.lowStockThreshold
  }

  public setLowStockThreshold(lowStockThreshold: number): void {
    this.lowStockThreshold = lowStockThreshold
  }

  public getCategory(): Category | string {
    return this.category
  }

  public setCategory(category: Category | string): void {
    this.category = category
  }
}
