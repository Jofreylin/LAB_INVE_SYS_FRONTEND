"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BeakerIcon, BoxesIcon, WarehouseIcon, ActivityIcon } from "lucide-react"
import { ProductService } from "@/lib/services/productService"
import { WarehouseService } from "@/lib/services/warehouseService"
import { InventoryService } from "@/lib/services/inventoryService"
import { Product, Warehouse, InventoryMovement } from "@/lib/types"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalMovements: 0,
    activeProducts: 0
  })
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data in parallel
        const [products, warehouses, movements] = await Promise.all([
          ProductService.getList(),
          WarehouseService.getList(),
          InventoryService.getMovements()
        ])
        
        setStats({
          totalProducts: products.length,
          activeProducts: products.filter((p: Product) => !p.isDeleted).length,
          totalWarehouses: warehouses.length,
          totalMovements: movements.length
        })
        
        // Get the 5 most recent movements
        const sortedMovements = [...movements].sort((a, b) => 
          new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
        ).slice(0, 5)
        
        setRecentMovements(sortedMovements)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const StatCard = ({ title, value, icon, description }: { title: string; value: number | string; icon: React.ReactNode; description: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? "--" : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Panel de Control</h2>
        <p className="text-muted-foreground">Vista general del sistema de inventario de laboratorio</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Productos Totales" 
          value={stats.totalProducts} 
          icon={<BeakerIcon className="h-4 w-4 text-primary" />}
          description="Productos en el sistema"
        />
        <StatCard 
          title="Productos Activos" 
          value={stats.activeProducts} 
          icon={<ActivityIcon className="h-4 w-4 text-primary" />}
          description="Productos actualmente disponibles"
        />
        <StatCard 
          title="Almacenes" 
          value={stats.totalWarehouses} 
          icon={<WarehouseIcon className="h-4 w-4 text-primary" />}
          description="Ubicaciones de almacenamiento"
        />
        <StatCard 
          title="Movimientos de Inventario" 
          value={stats.totalMovements} 
          icon={<BoxesIcon className="h-4 w-4 text-primary" />}
          description="Total de movimientos registrados"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Movimientos Recientes</CardTitle>
            <CardDescription>Últimas actividades de inventario en su laboratorio</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Cargando movimientos recientes...</p>
            ) : recentMovements.length > 0 ? (
              <div className="rounded-md border">
                <div className="grid grid-cols-[1fr_1fr_3fr_1fr] gap-4 p-4 font-medium border-b">
                  <div>Tipo</div>
                  <div>Fecha</div>
                  <div>Producto</div>
                  <div className="text-right">Cantidad</div>
                </div>
                {recentMovements.map((movement, index) => (
                  <div key={movement.movementId || index} className="grid grid-cols-[1fr_1fr_3fr_1fr] gap-4 p-4 items-center border-b last:border-0">
                    <div className={`inline-flex rounded-full px-2 py-1 text-xs ${movement.movementType === "Inbound" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {movement.movementType === "Inbound" ? "Entrada" : "Salida"}
                    </div>
                    <div className="text-sm text-muted-foreground">{formatDate(movement.movementDate)}</div>
                    <div className="text-sm">{movement.product?.name ?? "Producto Desconocido"}</div>
                    <div className="text-right font-medium">{movement.quantity}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4">No se encontraron movimientos recientes</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
