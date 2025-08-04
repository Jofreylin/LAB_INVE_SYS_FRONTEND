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
import { BeakerIcon, PlusIcon, PencilIcon, Trash2Icon, ShieldAlertIcon } from "lucide-react"
import { toast } from "sonner"
import { Product, ProductDTO } from "@/lib/types"
import { ProductService } from "@/lib/services/productService"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [productToEdit, setProductToEdit] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ProductDTO>({
    name: "",
    description: ""
  })
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const data = await ProductService.getList()
      setProducts(data)
    } catch (error) {
      console.error("Error al cargar productos:", error)
      toast.error("No se pudieron cargar los productos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async () => {
    try {
      await ProductService.create(formData)
      toast.success("Producto creado exitosamente")
      setFormData({ name: "", description: "" })
      setIsDialogOpen(false)
      fetchProducts()
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
      setFormData({ name: "", description: "" })
      setProductToEdit(null)
      setIsDialogOpen(false)
      fetchProducts()
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
      fetchProducts()
    } catch (error) {
      console.error("Error al eliminar producto:", error)
      toast.error("No se pudo eliminar el producto")
    }
  }

  const openEditDialog = (product: Product) => {
    setProductToEdit(product)
    setFormData({
      name: product.name,
      description: product.description || ""
    })
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteDialogOpen(true)
  }

  const openCreateDialog = () => {
    setProductToEdit(null)
    setFormData({ name: "", description: "" })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setProductToEdit(null)
    setFormData({ name: "", description: "" })
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
          <TabsTrigger value="active">Activos</TabsTrigger>
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
                          No products found.
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
              <CardTitle>Active Products</CardTitle>
              <CardDescription>
                List of active laboratory products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <p>Loading products...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead>Actions</TableHead>
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
                                  <span className="sr-only">Edit</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => openDeleteDialog(product)}
                                >
                                  <Trash2Icon className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => viewProductStock(product.productId)}
                                >
                                  <ShieldAlertIcon className="h-4 w-4" />
                                  <span className="sr-only">View Stock</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No active products found.
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
            <DialogTitle>{productToEdit ? "Edit Product" : "Create Product"}</DialogTitle>
            <DialogDescription>
              {productToEdit ? "Update product details" : "Add a new product to the inventory"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description (optional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={productToEdit ? handleUpdateProduct : handleCreateProduct}>
              {productToEdit ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{productToDelete?.name}</p>
            <p className="text-muted-foreground text-sm mt-1">{productToDelete?.description}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Delete Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
