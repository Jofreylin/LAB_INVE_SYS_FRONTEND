// Supplier related interfaces
export interface Supplier {
  supplierId: number;
  name?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface SupplierDTO {
  name: string;
  description: string;
}

export interface SupplierResponse {
  supplierId: number;
  executedAt?: string;
}

// Reservation status interface
export interface ReservationStatus {
  statusId: number;
  statusName: string;
}

// Product related interfaces
export interface Product {
  productId: number;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  commonPurchasePrice?: number;
  regularSalePrice?: number;
  maxSalePrice?: number;
  minSalePrice?: number;
  supplierId?: number;
  supplier?: Supplier;
}

export interface ProductDTO {
  name: string;
  description?: string;
  commonPurchasePrice?: number;
  regularSalePrice?: number;
  maxSalePrice?: number;
  minSalePrice?: number;
  supplierId?: number;
}

export interface ProductResponse {
  productId?: number;
  executedAt?: string;
}

export interface ProductStockResponse {
  productId?: number;
  executedAt?: string;
  totalAvailable?: number;
}

export interface ProductAvailabilityResponse {
  productId: number;
  productName?: string;
  totalAvailable: number;
}

// Warehouse related interfaces
export interface Warehouse {
  warehouseId: number;
  name: string;
  location?: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface WarehouseDTO {
  name: string;
  location?: string;
}

export interface WarehouseResponse {
  warehouseId?: number;
  executedAt?: string;
}

// Inventory movement related interfaces
export interface InventoryMovement {
  movementId: number;
  movementType: string;
  movementDate: string;
  productId: number;
  warehouseId: number;
  quantity: number;
  reservationId?: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  productExpirationDate?: string;
  purchasePrice?: number;
  product?: Product;
  warehouse?: Warehouse;
  reservation?: Reservation;
}

export interface InboundDTO {
  productId: number;
  warehouseId: number;
  quantity: number;
  productExpirationDate: string;
  purchasePrice: number;
}

export interface OutboundDTO {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export interface InventoryMovementResponse {
  movementId?: number;
  executedAt?: string;
}

// Stock related interfaces
export interface WarehouseStock {
  stockId: number;
  productId?: number;
  warehouseId?: number;
  availableQuantity: number;
  reservedQuantity: number;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  product?: Product;
  warehouse?: Warehouse;
}

export interface ReserveStockDTO {
  productId: number;
  warehouseId: number;
  quantity: number;
}

export interface ReserveStockResponse {
  reservationId?: number;
  executedAt?: string;
}

export interface ReleaseStockDTO {
  reservationId: number;
}

export interface ReleaseStockResponse {
  reservationId?: number;
  executedAt?: string;
}

// Reservation related interfaces
export interface Reservation {
  reservationId: number;
  productId?: number;
  warehouseId?: number;
  reservedQuantity: number;
  statusId: number;
  reservationDate: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  product?: Product;
  warehouse?: Warehouse;
}

export interface ReservationListResponse {
  reservationId: number;
  productId: number;
  productName?: string;
  warehouseId: number;
  warehouseName?: string;
  reservedQuantity: number;
  statusId: number;
  reservationDate: string;
}

// Monthly statistics interfaces
export interface MonthlyStats {
  year: number;
  month: number;
  monthName: string;
  totalInbound: number;
  totalOutbound: number;
  totalPurchaseCost: number;
}

export interface ProductMovementStats {
  monthlyStats: MonthlyStats[];
}
