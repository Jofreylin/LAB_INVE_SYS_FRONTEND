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
import { PlusIcon, PencilIcon, Trash2Icon, FlaskConicalIcon } from "lucide-react"
import { toast } from "sonner"
import { Supplier, SupplierDTO } from "@/lib/types"
import { SupplierService } from "@/lib/services/supplierService"

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [supplierToEdit, setSupplierToEdit] = useState<Supplier | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<SupplierDTO>({
    name: "",
    description: ""
  })
  const router = useRouter()

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    try {
      setLoading(true)
      const data = await SupplierService.getList()
      setSuppliers(data)
    } catch (error) {
      console.error("Error al cargar laboratorios:", error)
      toast.error("No se pudieron cargar los laboratorios")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSupplier = async () => {
    try {
      await SupplierService.create(formData)
      toast.success("Laboratorio creado exitosamente")
      setFormData({ name: "", description: "" })
      setIsDialogOpen(false)
      fetchSuppliers()
    } catch (error) {
      console.error("Error al crear laboratorio:", error)
      toast.error("No se pudo crear el laboratorio")
    }
  }

  const handleUpdateSupplier = async () => {
    if (!supplierToEdit) return
    
    try {
      await SupplierService.update(supplierToEdit.supplierId, formData)
      toast.success("Laboratorio actualizado exitosamente")
      setFormData({ name: "", description: "" })
      setSupplierToEdit(null)
      setIsDialogOpen(false)
      fetchSuppliers()
    } catch (error) {
      console.error("Error al actualizar laboratorio:", error)
      toast.error("No se pudo actualizar el laboratorio")
    }
  }

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return
    
    try {
      await SupplierService.delete(supplierToDelete.supplierId)
      toast.success("Laboratorio eliminado exitosamente")
      setSupplierToDelete(null)
      setIsDeleteDialogOpen(false)
      fetchSuppliers()
    } catch (error) {
      console.error("Error al eliminar laboratorio:", error)
      toast.error("No se pudo eliminar el laboratorio")
    }
  }

  const openEditDialog = (supplier: Supplier) => {
    setSupplierToEdit(supplier)
    setFormData({
      name: supplier.name || "",
      description: supplier.description || ""
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (supplier: Supplier) => {
    setSupplierToDelete(supplier)
    setIsDeleteDialogOpen(true)
  }

  const openCreateDialog = () => {
    setSupplierToEdit(null)
    setFormData({ name: "", description: "" })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setSupplierToEdit(null)
    setFormData({ name: "", description: "" })
  }

  const viewSupplierDetails = (supplierId: number) => {
    router.push(`/suppliers/${supplierId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Laboratorios</h2>
          <p className="text-muted-foreground">Gestionar laboratorios proveedores de productos</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Agregar Laboratorio
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Laboratorios</CardTitle>
          <CardDescription>
            Lista de todos los laboratorios proveedores
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Cargando laboratorios...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">Descripción</TableHead>
                  <TableHead className="hidden md:table-cell">Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length > 0 ? (
                  suppliers
                    .filter(s => !s.isDeleted)
                    .map((supplier) => (
                      <TableRow 
                        key={supplier.supplierId}
                        className="cursor-pointer"
                        onClick={() => viewSupplierDetails(supplier.supplierId)}
                      >
                        <TableCell className="font-medium">{supplier.supplierId}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FlaskConicalIcon className="h-4 w-4 text-primary" />
                            {supplier.name}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{supplier.description || "—"}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : "—"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => {
                                e.stopPropagation()
                                openEditDialog(supplier)
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
                                openDeleteDialog(supplier)
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
                      No se encontraron laboratorios.
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
            <DialogTitle>{supplierToEdit ? "Editar Laboratorio" : "Crear Laboratorio"}</DialogTitle>
            <DialogDescription>
              {supplierToEdit ? "Actualizar detalles del laboratorio" : "Añadir un nuevo laboratorio proveedor"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingrese nombre del laboratorio"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ingrese descripción del laboratorio (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={supplierToEdit ? handleUpdateSupplier : handleCreateSupplier}>
              {supplierToEdit ? "Guardar Cambios" : "Crear Laboratorio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Laboratorio</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea eliminar este laboratorio? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{supplierToDelete?.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{supplierToDelete?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteSupplier}>Eliminar Laboratorio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
