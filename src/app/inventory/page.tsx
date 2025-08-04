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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BoxesIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon } from "lucide-react"
import { toast } from "sonner"
import { 
  InventoryMovement, 
  InboundDTO, 
  OutboundDTO, 
  Product,
  Warehouse 
} from "@/lib/types"
import { InventoryService } from "@/lib/services/inventoryService"
import { ProductService } from "@/lib/services/productService"
import { WarehouseService } from "@/lib/services/warehouseService"

export default function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [isInboundDialogOpen, setIsInboundDialogOpen] = useState(false)
  const [isOutboundDialogOpen, setIsOutboundDialogOpen] = useState(false)
  const [inboundForm, setInboundForm] = useState<InboundDTO>({
    productId: 0,
    warehouseId: 0,
    quantity: 0,
    productExpirationDate: "",
    purchasePrice: 0
  })
  const [outboundForm, setOutboundForm] = useState<OutboundDTO>({
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
      const [movementsData, productsData, warehousesData] = await Promise.all([
        InventoryService.getMovements(),
        ProductService.getList(),
        WarehouseService.getList()
      ])
      
      setMovements(movementsData)
      setProducts(productsData.filter(p => !p.isDeleted))
      setWarehouses(warehousesData.filter(w => !w.isDeleted))
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
    }
  }

  const handleInboundSubmit = async () => {
    if (inboundForm.productId <= 0 || inboundForm.warehouseId <= 0 || inboundForm.quantity <= 0) {
      toast.error("Please fill all fields with valid values")
      return
    }
    
    try {
      await InventoryService.inbound(inboundForm)
      toast.success("Product received successfully")
      setIsInboundDialogOpen(false)
      resetInboundForm()
      fetchData()
    } catch (error) {
      console.error("Error processing inbound:", error)
      toast.error("Failed to process inbound movement")
    }
  }

  const handleOutboundSubmit = async () => {
    if (outboundForm.productId <= 0 || outboundForm.warehouseId <= 0 || outboundForm.quantity <= 0) {
      toast.error("Please fill all fields with valid values")
      return
    }
    
    try {
      await InventoryService.outbound(outboundForm)
      toast.success("Product shipped successfully")
      setIsOutboundDialogOpen(false)
      resetOutboundForm()
      fetchData()
    } catch (error) {
      console.error("Error processing outbound:", error)
      toast.error("Failed to process outbound movement")
    }
  }

  const resetInboundForm = () => {
    setInboundForm({
      productId: 0,
      warehouseId: 0,
      quantity: 0,
      productExpirationDate: "",
      purchasePrice: 0
    })
  }

  const resetOutboundForm = () => {
    setOutboundForm({
      productId: 0,
      warehouseId: 0,
      quantity: 0
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getProductName = (productId: number) => {
    const product = products.find(p => p.productId === productId)
    return product?.name || "Unknown Product"
  }

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.warehouseId === warehouseId)
    return warehouse?.name || "Unknown Warehouse"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Inventory</h2>
          <p className="text-muted-foreground">Manage product movements in and out of warehouses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsInboundDialogOpen(true)}>
            <ArrowDownIcon className="mr-2 h-4 w-4" />
            Inbound
          </Button>
          <Button onClick={() => setIsOutboundDialogOpen(true)}>
            <ArrowUpIcon className="mr-2 h-4 w-4" />
            Outbound
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Movements</TabsTrigger>
          <TabsTrigger value="inbound">Inbound</TabsTrigger>
          <TabsTrigger value="outbound">Outbound</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>All Inventory Movements</CardTitle>
              <CardDescription>
                Complete history of inventory activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading inventory movements...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length > 0 ? (
                      movements.map((movement, index) => (
                        <TableRow key={movement.movementId || index}>
                          <TableCell className="font-medium">{movement.movementId}</TableCell>
                          <TableCell>
                            <div className={`inline-flex rounded-full px-2 py-1 text-xs ${
                              movement.movementType === "Inbound"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                              {movement.movementType}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(movement.movementDate)}</TableCell>
                          <TableCell>
                            {movement.product?.name || getProductName(movement.productId || 0)}
                          </TableCell>
                          <TableCell>
                            {movement.warehouse?.name || getWarehouseName(movement.warehouseId || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            {movement.quantity}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No movements found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inbound" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Inbound Movements</CardTitle>
              <CardDescription>
                Products received into inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading inbound movements...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.filter(m => m.movementType === "Inbound").length > 0 ? (
                      movements
                        .filter(m => m.movementType === "Inbound")
                        .map((movement, index) => (
                          <TableRow key={movement.movementId || index}>
                            <TableCell className="font-medium">{movement.movementId}</TableCell>
                            <TableCell>{formatDate(movement.movementDate)}</TableCell>
                            <TableCell>
                              {movement.product?.name || getProductName(movement.productId || 0)}
                            </TableCell>
                            <TableCell>
                              {movement.warehouse?.name || getWarehouseName(movement.warehouseId || 0)}
                            </TableCell>
                            <TableCell className="text-right">
                              {movement.quantity}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No inbound movements found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outbound" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Outbound Movements</CardTitle>
              <CardDescription>
                Products shipped from inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading outbound movements...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Warehouse</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.filter(m => m.movementType === "Outbound").length > 0 ? (
                      movements
                        .filter(m => m.movementType === "Outbound")
                        .map((movement, index) => (
                          <TableRow key={movement.movementId || index}>
                            <TableCell className="font-medium">{movement.movementId}</TableCell>
                            <TableCell>{formatDate(movement.movementDate)}</TableCell>
                            <TableCell>
                              {movement.product?.name || getProductName(movement.productId || 0)}
                            </TableCell>
                            <TableCell>
                              {movement.warehouse?.name || getWarehouseName(movement.warehouseId || 0)}
                            </TableCell>
                            <TableCell className="text-right">
                              {movement.quantity}
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No outbound movements found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Inbound Dialog */}
      <Dialog open={isInboundDialogOpen} onOpenChange={setIsInboundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Entrada de Inventario</DialogTitle>
            <DialogDescription>
              Registrar productos recibidos en el inventario
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="inbound-product">Producto</Label>
              <Select 
                onValueChange={(value) => setInboundForm({ ...inboundForm, productId: parseInt(value) })}
                value={inboundForm.productId > 0 ? inboundForm.productId.toString() : ""}
                defaultValue=""
              >
                <SelectTrigger id="inbound-product">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.productId} value={product.productId.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="inbound-warehouse">Almacén</Label>
              <Select 
                onValueChange={(value) => setInboundForm({ ...inboundForm, warehouseId: parseInt(value) })}
                value={inboundForm.warehouseId > 0 ? inboundForm.warehouseId.toString() : ""}
                defaultValue=""
              >
                <SelectTrigger id="inbound-warehouse">
                  <SelectValue placeholder="Seleccionar almacén" />
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
              <Label htmlFor="inbound-quantity">Cantidad</Label>
              <Input
                id="inbound-quantity"
                type="number"
                min={1}
                value={inboundForm.quantity > 0 ? inboundForm.quantity : ""}
                onChange={(e) => setInboundForm({ ...inboundForm, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Ingrese la cantidad"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInboundDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleInboundSubmit}>Registrar Entrada</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Outbound Dialog */}
      <Dialog open={isOutboundDialogOpen} onOpenChange={setIsOutboundDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Agregar Salida de Inventario</DialogTitle>
            <DialogDescription>
              Registrar productos enviados desde el inventario
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="outbound-product">Producto</Label>
              <Select 
                onValueChange={(value) => setOutboundForm({ ...outboundForm, productId: parseInt(value) })}
                value={outboundForm.productId > 0 ? outboundForm.productId.toString() : ""}
                defaultValue=""
              >
                <SelectTrigger id="outbound-product">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.productId} value={product.productId.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="outbound-warehouse">Almacén</Label>
              <Select 
                onValueChange={(value) => setOutboundForm({ ...outboundForm, warehouseId: parseInt(value) })}
                value={outboundForm.warehouseId > 0 ? outboundForm.warehouseId.toString() : ""}
                defaultValue=""
              >
                <SelectTrigger id="outbound-warehouse">
                  <SelectValue placeholder="Seleccionar almacén" />
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
              <Label htmlFor="outbound-quantity">Cantidad</Label>
              <Input
                id="outbound-quantity"
                type="number"
                min={1}
                value={outboundForm.quantity > 0 ? outboundForm.quantity : ""}
                onChange={(e) => setOutboundForm({ ...outboundForm, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Ingrese la cantidad"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOutboundDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleOutboundSubmit}>Registrar Salida</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
