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
import { PlusIcon, RotateCcwIcon, ShieldIcon, BoxesIcon } from "lucide-react"
import { toast } from "sonner"
import { 
  Product,
  Warehouse,
  WarehouseStock,
  Reservation,
  ReserveStockDTO,
  ReleaseStockDTO,
  ReservationListResponse
} from "@/lib/types"
import { ProductService } from "@/lib/services/productService"
import { WarehouseService } from "@/lib/services/warehouseService"
import { StockService } from "@/lib/services/stockService"

export default function StockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [reservations, setReservations] = useState<ReservationListResponse[]>([])
  const [availableStock, setAvailableStock] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingReservations, setLoadingReservations] = useState(true)
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
      
      // Fetch reservations
      fetchReservations()
    } catch (error) {
      console.error("Error fetching stock data:", error)
      toast.error("No se pudieron cargar los datos de existencias")
      setLoading(false)
    }
  }

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true)
      const reservationsData = await StockService.getReservations()
      setReservations(reservationsData)
      setLoadingReservations(false)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      toast.error("No se pudieron cargar las reservaciones")
      setLoadingReservations(false)
    }
  }

  const handleReserveStock = async () => {
    if (reserveForm.productId <= 0 || reserveForm.warehouseId <= 0 || reserveForm.quantity <= 0) {
      toast.error("Por favor complete todos los campos con valores válidos")
      return
    }
    
    try {
      const response = await StockService.reserve(reserveForm)
      toast.success(`Existencias reservadas con éxito. ID de Reserva: ${response.reservationId}`)
      setIsReserveDialogOpen(false)
      resetReserveForm()
      fetchData()
    } catch (error) {
      console.error("Error reserving stock:", error)
      toast.error("No se pudo reservar el stock. Asegúrese de tener suficiente cantidad disponible.")
    }
  }

  const handleReleaseStock = async (reservationId: number) => {
    try {
      await StockService.release({ reservationId })
      toast.success("Stock liberado con éxito")
      fetchData()
    } catch (error) {
      console.error("Error releasing stock:", error)
      toast.error("No se pudo liberar el stock")
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
    return product?.name || "Producto Desconocido"
  }

  const getWarehouseName = (warehouseId: number) => {
    const warehouse = warehouses.find(w => w.warehouseId === warehouseId)
    return warehouse?.name || "Almacén Desconocido"
  }

  const getAvailableQuantity = (productId: number) => {
    const item = availableStock.find(item => item.productId === productId)
    return item?.totalAvailable || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Gestión de Stock</h2>
          <p className="text-muted-foreground">Reserve y libere existencias de productos</p>
        </div>
        <Button onClick={() => setIsReserveDialogOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Reservar Stock
        </Button>
      </div>

      <Tabs defaultValue="stock">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="stock">Existencias Disponibles</TabsTrigger>
          <TabsTrigger value="reservations">Reservaciones</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Existencias Disponibles</CardTitle>
              <CardDescription>
                Cantidades disponibles actuales por producto
              </CardDescription>
            </CardHeader>
            <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Cargando datos de existencias...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Producto</TableHead>
                  <TableHead>Nombre del Producto</TableHead>
                  <TableHead className="text-right">Cantidad Disponible</TableHead>
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
                          Reservar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No hay datos de existencias disponibles.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TabsContent>
    
    <TabsContent value="reservations">
      <Card>
        <CardHeader>
          <CardTitle>Reservaciones de Stock</CardTitle>
          <CardDescription>
            Listado de reservaciones activas que pueden ser liberadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingReservations ? (
            <div className="flex justify-center py-8">
              <p>Cargando datos de reservaciones...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Reserva</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Almacén</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length > 0 ? (
                  reservations.map((reservation) => (
                    <TableRow key={reservation.reservationId}>
                      <TableCell>{reservation.reservationId}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BoxesIcon className="h-4 w-4 text-primary" />
                          {reservation.productName || getProductName(reservation.productId)}
                        </div>
                      </TableCell>
                      <TableCell>{reservation.warehouseName || getWarehouseName(reservation.warehouseId)}</TableCell>
                      <TableCell className="text-right font-medium">{reservation.reservedQuantity}</TableCell>
                      <TableCell>{new Date(reservation.reservationDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className={`inline-flex rounded-full px-2 py-1 text-xs ${reservation.statusId === 1 ? "bg-blue-100" : "bg-gray-100"}`}>
                          {reservation.statusId === 1 ? "Reservado" : "Cancelado"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.statusId === 1 && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleReleaseStock(reservation.reservationId)}
                          >
                            <RotateCcwIcon className="h-4 w-4 mr-1" />
                            Liberar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No hay reservaciones activas.
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
      
      {/* Reserve Dialog */}
      <Dialog open={isReserveDialogOpen} onOpenChange={setIsReserveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reservar Stock</DialogTitle>
            <DialogDescription>
              Reservar existencias de un producto de un almacén específico
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reserve-product">Producto</Label>
              <Select 
                onValueChange={(value) => setReserveForm({ ...reserveForm, productId: parseInt(value) })}
                value={reserveForm.productId > 0 ? reserveForm.productId.toString() : undefined}
              >
                <SelectTrigger id="reserve-product">
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.productId} value={product.productId.toString()}>
                      {product.name} (Disponible: {getAvailableQuantity(product.productId)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="reserve-warehouse">Almacén</Label>
              <Select 
                onValueChange={(value) => setReserveForm({ ...reserveForm, warehouseId: parseInt(value) })}
                value={reserveForm.warehouseId > 0 ? reserveForm.warehouseId.toString() : undefined}
              >
                <SelectTrigger id="reserve-warehouse">
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
              <Label htmlFor="reserve-quantity">Cantidad</Label>
              <Input
                id="reserve-quantity"
                type="number"
                min={1}
                value={reserveForm.quantity > 0 ? reserveForm.quantity : ""}
                onChange={(e) => setReserveForm({ ...reserveForm, quantity: parseInt(e.target.value) || 0 })}
                placeholder="Ingrese la cantidad a reservar"
              />
              {reserveForm.productId > 0 && (
                <p className="text-xs text-muted-foreground">
                  Disponible: {getAvailableQuantity(reserveForm.productId)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReserveDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleReserveStock}>Reservar Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
