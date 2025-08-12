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
import { BoxesIcon, PlusIcon, ArrowDownIcon, ArrowUpIcon, CalendarIcon, DollarSignIcon } from "lucide-react"
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
      console.error("Error al obtener datos de inventario:", error)
      toast.error("No se pudo cargar la información de inventario")
    } finally {
      setLoading(false)
    }
  }

  const handleInboundSubmit = async () => {
    if (inboundForm.productId <= 0 || inboundForm.warehouseId <= 0 || inboundForm.quantity <= 0 || !inboundForm.productExpirationDate || inboundForm.purchasePrice <= 0) {
      toast.error("Por favor complete todos los campos con valores válidos")
      return
    }
    
    try {
      await InventoryService.inbound(inboundForm)
      toast.success("Producto recibido correctamente")
      setIsInboundDialogOpen(false)
      resetInboundForm()
      fetchData()
    } catch (error) {
      console.error("Error al procesar la entrada:", error)
      toast.error("No se pudo procesar la entrada de inventario")
    }
  }

  const handleOutboundSubmit = async () => {
    if (outboundForm.productId <= 0 || outboundForm.warehouseId <= 0 || outboundForm.quantity <= 0) {
      toast.error("Por favor complete todos los campos con valores válidos")
      return
    }
    
    try {
      await InventoryService.outbound(outboundForm)
      toast.success("Producto despachado correctamente")
      setIsOutboundDialogOpen(false)
      resetOutboundForm()
      fetchData()
    } catch (error) {
      console.error("Error al procesar la salida:", error)
      toast.error("No se pudo procesar la salida de inventario")
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
    return new Intl.DateTimeFormat('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getProductName = (productId: number) => {
    const product = products.find(p => p.productId === productId)
    return product?.name || "Producto Desconocido"
  }

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.warehouseId === warehouseId)
    return warehouse?.name || "Almacén Desconocido"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Inventario</h2>
          <p className="text-muted-foreground">Gestione los movimientos de productos dentro y fuera de los almacenes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsInboundDialogOpen(true)}>
            <ArrowDownIcon className="mr-2 h-4 w-4" />
            Entrada
          </Button>
          <Button onClick={() => setIsOutboundDialogOpen(true)}>
            <ArrowUpIcon className="mr-2 h-4 w-4" />
            Salida
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos los Movimientos</TabsTrigger>
          <TabsTrigger value="inbound">Entradas</TabsTrigger>
          <TabsTrigger value="outbound">Salidas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Todos los Movimientos de Inventario</CardTitle>
              <CardDescription>
                Historial completo de la actividad de inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando movimientos de inventario...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Almacén</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead className="hidden md:table-cell">Precio Compra Unitario</TableHead>
                      <TableHead className="hidden md:table-cell">Precio Total</TableHead>
                      <TableHead className="hidden md:table-cell">Expiración</TableHead>
                      <TableHead>Fecha</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.length > 0 ? (
                      movements.map((movement, index) => (
                        <TableRow key={movement.movementId || index}>
                          <TableCell className="font-medium">{movement.movementId}</TableCell>
                          <TableCell>
                            <div className={`inline-flex rounded-full px-2 py-1 text-xs ${
                              movement.movementType === "ENTRY"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}>
                              {movement.movementType === "ENTRY" ? "Entrada" : "Salida"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {movement.product?.name || getProductName(movement.productId || 0)}
                          </TableCell>
                          <TableCell>
                            {movement.warehouse?.name || getWarehouseName(movement.warehouseId || 0)}
                          </TableCell>
                          <TableCell>
                            {movement.quantity}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {movement.purchasePrice ? `$${movement.purchasePrice.toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {movement.purchasePrice ? `$${(movement.purchasePrice * movement.quantity).toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {movement.productExpirationDate ? formatDate(movement.productExpirationDate) : "—"}
                          </TableCell>
                          <TableCell>{formatDate(movement.movementDate)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No se encontraron movimientos.
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
              <CardTitle>Movimientos de Entrada</CardTitle>
              <CardDescription>
                Productos recibidos en el inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando movimientos de entrada...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Almacén</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.filter(m => m.movementType === "ENTRY").length > 0 ? (
                      movements
                        .filter(m => m.movementType === "ENTRY")
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
                          No se encontraron movimientos de entrada.
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
              <CardTitle>Movimientos de Salida</CardTitle>
              <CardDescription>
                Productos despachados desde el inventario
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando movimientos de salida...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Producto</TableHead>
                      <TableHead>Almacén</TableHead>
                      <TableHead className="text-right">Cantidad</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.filter(m => m.movementType === "EXIT").length > 0 ? (
                      movements
                        .filter(m => m.movementType === "EXIT")
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
                          No se encontraron movimientos de salida.
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

            <div className="grid gap-2">
              <Label htmlFor="inbound-expiration-date">Fecha de Expiración</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="inbound-expiration-date"
                  type="date"
                  className="pl-8"
                  value={inboundForm.productExpirationDate}
                  onChange={(e) => setInboundForm({ ...inboundForm, productExpirationDate: e.target.value })}
                  placeholder="Seleccione fecha de expiración"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="inbound-purchase-price">Precio de Compra Unitario</Label>
              <div className="relative">
                <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="inbound-purchase-price"
                  type="number"
                  className="pl-8"
                  min={0}
                  step="0.01"
                  value={inboundForm.purchasePrice > 0 ? inboundForm.purchasePrice : ""}
                  onChange={(e) => setInboundForm({ ...inboundForm, purchasePrice: parseFloat(e.target.value) || 0 })}
                  placeholder="0.00"
                />
              </div>
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
