"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { PlusIcon, PencilIcon, Trash2Icon, WarehouseIcon } from "lucide-react"
import { toast } from "sonner"
import { Warehouse, WarehouseDTO } from "@/lib/types"
import { WarehouseService } from "@/lib/services/warehouseService"

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [warehouseToEdit, setWarehouseToEdit] = useState<Warehouse | null>(null)
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<WarehouseDTO>({
    name: "",
    location: ""
  })
  const router = useRouter()

  useEffect(() => {
    fetchWarehouses()
  }, [])

  const fetchWarehouses = async () => {
    try {
      setLoading(true)
      const data = await WarehouseService.getList()
      setWarehouses(data)
    } catch (error) {
      console.error("Error al cargar almacenes:", error)
      toast.error("No se pudieron cargar los almacenes")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWarehouse = async () => {
    try {
      await WarehouseService.create(formData)
      toast.success("Almacén creado exitosamente")
      setFormData({ name: "", location: "" })
      setIsDialogOpen(false)
      fetchWarehouses()
    } catch (error) {
      console.error("Error al crear almacén:", error)
      toast.error("No se pudo crear el almacén")
    }
  }

  const handleUpdateWarehouse = async () => {
    if (!warehouseToEdit) return
    
    try {
      await WarehouseService.update(warehouseToEdit.warehouseId, formData)
      toast.success("Almacén actualizado exitosamente")
      setFormData({ name: "", location: "" })
      setWarehouseToEdit(null)
      setIsDialogOpen(false)
      fetchWarehouses()
    } catch (error) {
      console.error("Error al actualizar almacén:", error)
      toast.error("No se pudo actualizar el almacén")
    }
  }

  const handleDeleteWarehouse = async () => {
    if (!warehouseToDelete) return
    
    try {
      await WarehouseService.delete(warehouseToDelete.warehouseId)
      toast.success("Almacén eliminado exitosamente")
      setWarehouseToDelete(null)
      setIsDeleteDialogOpen(false)
      fetchWarehouses()
    } catch (error) {
      console.error("Error al eliminar almacén:", error)
      toast.error("No se pudo eliminar el almacén")
    }
  }

  const openEditDialog = (warehouse: Warehouse) => {
    setWarehouseToEdit(warehouse)
    setFormData({
      name: warehouse.name,
      location: warehouse.location || ""
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse)
    setIsDeleteDialogOpen(true)
  }

  const openCreateDialog = () => {
    setWarehouseToEdit(null)
    setFormData({ name: "", location: "" })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setWarehouseToEdit(null)
    setFormData({ name: "", location: "" })
  }

  const viewWarehouseDetails = (warehouseId: number) => {
    router.push(`/warehouses/${warehouseId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Almacenes</h2>
          <p className="text-muted-foreground">Gestionar ubicaciones de almacenamiento del laboratorio</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Agregar Almacén
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Almacenes</CardTitle>
          <CardDescription>
            Lista de todas las ubicaciones de almacenamiento del laboratorio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Cargando almacenes...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Ubicación</TableHead>
                  <TableHead className="hidden md:table-cell">Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.length > 0 ? (
                  warehouses
                    .filter(w => !w.isDeleted)
                    .map((warehouse) => (
                      <TableRow 
                        key={warehouse.warehouseId}
                        className="cursor-pointer"
                        onClick={() => viewWarehouseDetails(warehouse.warehouseId)}
                      >
                        <TableCell className="font-medium">{warehouse.warehouseId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <WarehouseIcon className="h-4 w-4 text-primary" />
                            {warehouse.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{warehouse.location || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {warehouse.createdAt ? new Date(warehouse.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(warehouse)
                              }}
                            >
                              <PencilIcon className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation()
                                openDeleteDialog(warehouse)
                              }}
                            >
                              <Trash2Icon className="h-4 w-4" />
                              <span className="sr-only">Eliminar</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron almacenes.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{warehouseToEdit ? "Editar Almacén" : "Crear Almacén"}</DialogTitle>
            <DialogDescription>
              {warehouseToEdit ? "Actualizar detalles del almacén" : "Añadir una nueva ubicación de almacenamiento"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingrese nombre del almacén"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location">Ubicación</Label>
              <Input
                id="location"
                value={formData.location || ""}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ingrese ubicación del almacén (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={warehouseToEdit ? handleUpdateWarehouse : handleCreateWarehouse}>
              {warehouseToEdit ? "Guardar Cambios" : "Crear Almacén"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Almacén</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este almacén? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{warehouseToDelete?.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{warehouseToDelete?.location}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteWarehouse}>Eliminar Almacén</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
