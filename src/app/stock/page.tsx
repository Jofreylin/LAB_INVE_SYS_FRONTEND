"use client"

import { useState, useEffect } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, RotateCcwIcon, ShieldIcon, BoxesIcon } from "lucide-react"
import { toast } from "sonner"
import { 
  Product,
  Warehouse,
  WarehouseStock,
  Reservation,
  ReserveStockDTO,
  ReleaseStockDTO
} from "@/lib/types"
import { ProductService } from "@/lib/services/productService"
import { WarehouseService } from "@/lib/services/warehouseService"
import { StockService } from "@/lib/services/stockService"

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [availableStock, setAvailableStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isReserveDialogOpen, setIsReserveDialogOpen] = useState(false)
  const [reserveForm, setReserveForm] = useState<ReserveStockDTO>({
    productId: 0,
    warehouseId: 0,
    quantity: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch products and warehouses
      const [productsData, warehousesData] = await Promise.all([
        ProductService.getList(),
        WarehouseService.getList()
      ])
      
      setProducts(productsData.filter(p => !p.isDeleted))
      setWarehouses(warehousesData.filter(w => !w.isDeleted))
      
      // Let's also get product availability for display
      const availabilityData = await ProductService.getAvailability()
      setAvailableStock(availabilityData)
      
      setLoading(false)
    } catch (error) {
      console.error("Error fetching stock data:", error)
      toast.error("Failed to load stock data")
      setLoading(false)
    }
  }

  const handleReserveStock = async () => {
    if (reserveForm.productId <= 0 || reserveForm.warehouseId <= 0 || reserveForm.quantity <= 0) {
      toast.error("Please fill all fields with valid values")
      return
    }
    
    try {
      const response = await StockService.reserve(reserveForm)
      toast.success(`Stock reserved successfully. Reservation ID: ${response.reservationId}`)
      setIsReserveDialogOpen(false)
      resetReserveForm()
      fetchData()
    } catch (error) {
      console.error("Error reserving stock:", error)
      toast.error("Failed to reserve stock. Make sure you have enough available quantity.")
    }
  }

  const handleReleaseStock = async (reservationId: number) => {
    try {
      await StockService.release({ reservationId })
      toast.success("Stock released successfully")
      fetchData()
    } catch (error) {
      console.error("Error releasing stock:", error)
      toast.error("Failed to release stock")
    }
  }

  const resetReserveForm = () => {
    setReserveForm({
      productId: 0,
      warehouseId: 0,
      quantity: 0
    })
  }

  const getProductName = (productId: number) => {
    const product = products.find(p => p.productId === productId)
    return product?.name || "Unknown Product"
  }

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.warehouseId === warehouseId)
    return warehouse?.name || "Unknown Warehouse"
  }

  const getAvailableQuantity = (productId: number) => {
    const item = availableStock.find(item => item.productId === productId)
    return item?.totalAvailable || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Stock Management</h2>
          <p className="text-muted-foreground">Reserve and release stock for products</p>
        </div>
        <Button onClick={() => setIsReserveDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Reserve Stock
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Stock</CardTitle>
          <CardDescription>
            Current available quantities by product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading stock data...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="text-right">Available Quantity</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {availableStock.length > 0 ? (
                  availableStock.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BoxesIcon className="h-4 w-4 text-primary" />
                          {item.productName || getProductName(item.productId)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {item.totalAvailable}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setReserveForm({
                              ...reserveForm,
                              productId: item.productId
                            })
                            setIsReserveDialogOpen(true)
                          }}
                        >
                          Reserve
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No stock data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Reserve Dialog */}
      <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reserve Stock</DialogTitle>
            <DialogDescription>
              Reserve product stock from a specific warehouse
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reserve-product">Product</Label>
              <Select 
                onValueChange={(value) => setReserveForm({ ...reserveForm, productId: parseInt(value) })}
                value={reserveForm.productId > 0 ? reserveForm.productId.toString() : undefined}
              >
                <SelectTrigger id="reserve-product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.productId} value={product.productId.toString()}>
                      {product.name} (Available: {getAvailableQuantity(product.productId)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reserve-warehouse">Warehouse</Label>
              <Select 
                onValueChange={(value) => setReserveForm({ ...reserveForm, warehouseId: parseInt(value) })}
                value={reserveForm.warehouseId > 0 ? reserveForm.warehouseId.toString() : undefined}
              >
                <SelectTrigger id="reserve-warehouse">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.warehouseId} value={warehouse.warehouseId.toString()}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reserve-quantity">Quantity</Label>
              <Input
                id="reserve-quantity"
                type="number"
                min={1}
                value={reserveForm.quantity > 0 ? reserveForm.quantity : ""}
                onChange={(e) => setReserveForm({ ...reserveForm, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Enter quantity to reserve"
              />
              {reserveForm.productId > 0 && (
                <p className="text-xs text-muted-foreground">
                  Available: {getAvailableQuantity(reserveForm.productId)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReserveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleReserveStock}>Reserve Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
