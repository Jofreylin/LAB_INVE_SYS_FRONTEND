"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BeakerIcon, PlusIcon, PencilIcon, Trash2Icon, ShieldAlertIcon, DollarSignIcon } from "lucide-react"
import { toast } from "sonner"
import { Product, ProductDTO, Supplier } from "@/lib/types"
import { ProductService } from "@/lib/services/productService"
import { SupplierService } from "@/lib/services/supplierService"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProductDTO>({
    name: "",
    description: "",
    commonPurchasePrice: 0,
    regularSalePrice: 0,
    maxSalePrice: 0,
    minSalePrice: 0,
    supplierId: undefined
  })
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsData, suppliersData] = await Promise.all([
        ProductService.getList(),
        SupplierService.getList()
      ])
      setProducts(productsData)
      setSuppliers(suppliersData.filter(s => !s.isDeleted))
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("No se pudieron cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      await ProductService.create(formData)
      toast.success("Producto creado exitosamente")
      resetForm()
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error al crear producto:", error)
      toast.error("No se pudo crear el producto")
    }
  }

  const handleUpdateProduct = async () => {
    if (!productToEdit) return
    
    try {
      await ProductService.update(productToEdit.productId, formData)
      toast.success("Producto actualizado exitosamente")
      resetForm()
      setProductToEdit(null)
      setIsDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error al actualizar producto:", error)
      toast.error("No se pudo actualizar el producto")
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    
    try {
      await ProductService.delete(productToDelete.productId)
      toast.success("Producto eliminado exitosamente")
      setProductToDelete(null)
      setIsDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast.error("No se pudo eliminar el producto")
    }
  }

  const openEditDialog = (product: Product) => {
    setProductToEdit(product)
    setFormData({
      name: product.name,
      description: product.description || "",
      commonPurchasePrice: product.commonPurchasePrice || 0,
      regularSalePrice: product.regularSalePrice || 0,
      maxSalePrice: product.maxSalePrice || 0,
      minSalePrice: product.minSalePrice || 0,
      supplierId: product.supplierId
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const openCreateDialog = () => {
    setProductToEdit(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      name: "", 
      description: "",
      commonPurchasePrice: 0,
      regularSalePrice: 0,
      maxSalePrice: 0,
      minSalePrice: 0,
      supplierId: undefined
    })
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setProductToEdit(null)
    resetForm()
  }

  const viewProductStock = (productId: number) => {
    router.push(`/products/${productId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Productos</h2>
          <p className="text-muted-foreground">Gestionar inventario de productos de laboratorio</p>
        </div>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Agregar Producto
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos los Productos</TabsTrigger>
          {/* <TabsTrigger value="active">Activos</TabsTrigger> */}
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Todos los Productos</CardTitle>
              <CardDescription>
                Lista completa de todos los productos del laboratorio
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando productos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Descripción</TableHead>
                      <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                      <TableHead className="hidden lg:table-cell">Laboratorio</TableHead>
                      <TableHead className="hidden md:table-cell">Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <TableRow key={product.productId}>
                          <TableCell className="font-medium">{product.productId}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BeakerIcon className="h-4 w-4 text-primary" />
                              {product.name}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{product.description || "—"}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.regularSalePrice ? `$${product.regularSalePrice.toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {product.supplierId && suppliers.find(s => s.supplierId === product.supplierId)?.name || "—"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => openEditDialog(product)}
                              >
                                <PencilIcon className="h-4 w-4" />
                                <span className="sr-only">Editar</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2Icon className="h-4 w-4" />
                                <span className="sr-only">Eliminar</span>
                              </Button>
                              {/* <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => viewProductStock(product.productId)}
                              >
                                <ShieldAlertIcon className="h-4 w-4" />
                                <span className="sr-only">Ver Existencias</span>
                              </Button> */}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No se encontraron productos.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Productos Activos</CardTitle>
              <CardDescription>
                Lista de productos de laboratorio activos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Cargando productos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="hidden md:table-cell">Descripción</TableHead>
                      <TableHead className="hidden md:table-cell">Precio Venta</TableHead>
                      <TableHead className="hidden lg:table-cell">Laboratorio</TableHead>
                      <TableHead className="hidden md:table-cell">Creado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.filter(p => !p.isDeleted).length > 0 ? (
                      products
                        .filter(p => !p.isDeleted)
                        .map((product) => (
                          <TableRow key={product.productId}>
                            <TableCell className="font-medium">{product.productId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BeakerIcon className="h-4 w-4 text-primary" />
                                {product.name}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{product.description || "—"}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {product.regularSalePrice ? `$${product.regularSalePrice.toFixed(2)}` : "—"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {product.supplierId && suppliers.find(s => s.supplierId === product.supplierId)?.name || "—"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "—"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => openEditDialog(product)}
                                >
                                  <PencilIcon className="h-4 w-4" />
                                  <span className="sr-only">Editar</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => openDeleteDialog(product)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                  <span className="sr-only">Eliminar</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => viewProductStock(product.productId)}
                                >
                                  <ShieldAlertIcon className="h-4 w-4" />
                                  <span className="sr-only">Ver Existencias</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No se encontraron productos activos.
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
      
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{productToEdit ? "Editar Producto" : "Crear Producto"}</DialogTitle>
            <DialogDescription>
              {productToEdit ? "Actualizar detalles del producto" : "Agregar un nuevo producto al inventario"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ingrese el nombre del producto"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Ingrese la descripción del producto (opcional)"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="commonPurchasePrice">Precio de Compra</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="commonPurchasePrice"
                    type="number"
                    className="pl-8"
                    value={formData.commonPurchasePrice || 0}
                    onChange={(e) => setFormData({ ...formData, commonPurchasePrice: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="regularSalePrice">Precio de Venta Regular</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="regularSalePrice"
                    type="number"
                    className="pl-8"
                    value={formData.regularSalePrice || 0}
                    onChange={(e) => setFormData({ ...formData, regularSalePrice: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="minSalePrice">Precio de Venta Mínimo</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="minSalePrice"
                    type="number"
                    className="pl-8"
                    value={formData.minSalePrice || 0}
                    onChange={(e) => setFormData({ ...formData, minSalePrice: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maxSalePrice">Precio de Venta Máximo</Label>
                <div className="relative">
                  <DollarSignIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maxSalePrice"
                    type="number"
                    className="pl-8"
                    value={formData.maxSalePrice || 0}
                    onChange={(e) => setFormData({ ...formData, maxSalePrice: parseFloat(e.target.value) })}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplierId">Laboratorio</Label>
              <Select
                value={formData.supplierId?.toString() || "0"}
                onValueChange={(value) => setFormData({ ...formData, supplierId: value !== "0" ? parseInt(value) : undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un laboratorio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ninguno</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={productToEdit ? handleUpdateProduct : handleCreateProduct}>
              {productToEdit ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Eliminar Producto</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{productToDelete?.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{productToDelete?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Eliminar Producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
