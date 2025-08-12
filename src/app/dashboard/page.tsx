"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BeakerIcon, BoxesIcon, WarehouseIcon, ActivityIcon, DollarSignIcon } from "lucide-react"
import { ProductService } from "@/lib/services/productService"
import { WarehouseService } from "@/lib/services/warehouseService"
import { InventoryService } from "@/lib/services/inventoryService"
import { Product, Warehouse, InventoryMovement, MonthlyStats } from "@/lib/types"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarehouses: 0,
    totalMovements: 0,
    activeProducts: 0
  })
  const [recentMovements, setRecentMovements] = useState<InventoryMovement[]>([])
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch data in parallel
        const [products, warehouses, movements, statsData] = await Promise.all([
          ProductService.getList(),
          WarehouseService.getList(),
          InventoryService.getMovements(),
          InventoryService.getMonthlyStats(selectedYear)
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
        setMonthlyStats(statsData.monthlyStats || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [selectedYear])

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

  // Función para formatear valores monetarios
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2
    }).format(value);
  }

  // Función para manejar el cambio de año
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(e.target.value));
  }

  // Años disponibles para seleccionar (últimos 5 años)
  const availableYears = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

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

      {/* Gráficas de estadísticas mensuales */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <div className="col-span-full">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h3 className="text-xl font-semibold tracking-tight">Estadísticas Mensuales</h3>
            <div className="flex items-center space-x-3">
              <label htmlFor="yearSelect" className="text-sm font-medium">Año:</label>
              <select
                id="yearSelect"
                value={selectedYear}
                onChange={handleYearChange}
                className="h-9 w-[100px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Movimientos de Inventario</CardTitle>
            <CardDescription>Entradas y salidas de productos por mes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Cargando estadísticas...</p>
            ) : monthlyStats.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    barGap={8}
                    barSize={16}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="monthName" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value} unidades`, undefined]}
                      labelFormatter={(label) => `${label} ${selectedYear}`}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '3px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar 
                      dataKey="totalInbound" 
                      name="Entradas" 
                      fill="#82ca9d" 
                    />
                    <Bar 
                      dataKey="totalOutbound" 
                      name="Salidas" 
                      fill="#f59e0b" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-4">No hay datos disponibles para este año</p>
            )}
          </CardContent>
        </Card>

        {/* Gráfica de costos mensuales */}
        <Card>
          <CardHeader>
            <CardTitle>Costos de Compra</CardTitle>
            <CardDescription>Gastos mensuales en compras de productos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-4">Cargando datos de costos...</p>
            ) : monthlyStats.length > 0 ? (
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
                    <XAxis 
                      dataKey="monthName" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#666', fontSize: 12 }}
                      tickFormatter={(value) => value === 0 ? '0' : `${Math.round(value / 1000)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), "Costo de Compra"]}
                      labelFormatter={(label) => `${label} ${selectedYear}`}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        borderRadius: '3px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: 'none'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalPurchaseCost" 
                      name="Costo de Compra" 
                      stroke="#8884d8" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#8884d8' }} 
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center py-4">No hay datos de costos disponibles para este año</p>
            )}
          </CardContent>
        </Card>
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
                    <div className={`inline-flex rounded-full px-2 py-1 text-xs ${movement.movementType === "ENTRY" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {movement.movementType === "ENTRY" ? "Entrada" : "Salida"}
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
