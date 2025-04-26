
import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash, Save, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { 
  products as availableProducts, 
  Product,
  PurchaseItem,
  purchases,
  Purchase,
  getNextPurchaseId,
  updateInventoryFromPurchase
} from '@/services/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Purchase = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [purchaseData, setPurchaseData] = useState<PurchaseType[]>([...purchases]);
  const [editedRow, setEditedRow] = useState<PurchaseType | null>(null);
  
  const filteredPurchases = purchaseData.filter(purchase =>
    purchase.purchaseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (purchase: PurchaseType) => {
    setEditedRow({ ...purchase });
  };

  const saveChanges = () => {
    if (editedRow) {
      const updatedPurchases = purchaseData.map(item =>
        item.purchaseId === editedRow.purchaseId ? editedRow : item
      );
      setPurchaseData(updatedPurchases);
      setEditedRow(null);
      
      toast({
        title: "Purchase Updated",
        description: `${editedRow.purchaseId} has been updated successfully`,
      });
    }
  };

  const cancelEdit = () => {
    setEditedRow(null);
  };

  const toggleEditMode = () => {
    if (editMode && editedRow) {
      // If we're exiting edit mode but there's an active edit, cancel it
      setEditedRow(null);
    }
    setEditMode(!editMode);
  };

  const handleInputChange = (field: keyof PurchaseType, value: string | number) => {
    if (editedRow) {
      setEditedRow({
        ...editedRow,
        [field]: typeof value === 'string' && !isNaN(Number(value)) 
          ? value
          : value
      });
    }
  };

  const columns = [
    { 
      header: 'Purchase ID', 
      accessorKey: 'purchaseId' as keyof PurchaseType
    },
    { 
      header: 'Supplier Name', 
      accessorKey: 'supplierName' as keyof PurchaseType
    },
    { 
      header: 'Purchase Date', 
      accessorKey: 'purchaseDate' as keyof PurchaseType 
    },
    { 
      header: 'Total Amount', 
      accessorKey: 'totalAmount' as keyof PurchaseType
    },
    {
      header: 'Actions',
      accessorKey: (row: PurchaseType) => {
        if (editMode) {
          if (editedRow && editedRow.purchaseId === row.purchaseId) {
            return (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={saveChanges} className="text-green-600">
                  <Check className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-600">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }
          return (
            <Button variant="ghost" size="sm" onClick={() => handleEdit(row)}>
              Edit
            </Button>
          );
        }
        return null;
      },
    },
  ];

  // New purchase dialog state
  const [newPurchaseDialogOpen, setNewPurchaseDialogOpen] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [products, setProducts] = useState<PurchaseItem[]>([
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
  ]);

  const handleProductChange = (index: number, field: "productName" | "quantity" | "purchasePrice", value: string) => {
    const updatedProducts = [...products];
    
    if (field === "productName") {
      // Update product name
      const product = availableProducts.find((p) => p.productId === parseInt(value));
      if (product) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          productId: product.productId,
          productName: product.productName,
          purchasePrice: product.defaultSalesPrice,
        };
      }
    } else if (field === "quantity") {
      // Update quantity
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity: parseInt(value) || 0,
      };
    } else if (field === "purchasePrice") {
      // Update purchase price
      updatedProducts[index] = {
        ...updatedProducts[index],
        purchasePrice: parseFloat(value) || 0,
      };
    }
    
    setProducts(updatedProducts);
  };

  const addProductRow = () => {
    setProducts([
      ...products,
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    ]);
  };

  const removeProductRow = (index: number) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const calculateTotalAmount = () => {
    return products.reduce((total, product) => {
      return total + (product.purchasePrice * product.quantity);
    }, 0);
  };

  const addNewPurchase = async () => {
    // Validate fields
    if (!supplierName) {
      toast({
        title: "Validation Error",
        description: "Please enter the supplier name.",
        variant: "destructive"
      });
      return;
    }

    // Filter out products with no product name or zero quantity
    const validProducts = products.filter(
      p => p.productName && p.quantity > 0 && p.purchasePrice > 0
    );

    if (validProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product with valid quantity and price.",
        variant: "destructive"
      });
      return;
    }

    // Create new purchase with next available ID
    const nextId = getNextPurchaseId();
    const totalAmount = calculateTotalAmount();
    const purchaseToAdd: PurchaseType = {
      purchaseId: nextId,
      supplierName: supplierName,
      purchaseDate: new Date().toISOString().split('T')[0], // Current date
      products: validProducts,
      totalAmount: totalAmount,
    };

    // Add to purchase
    setPurchaseData([purchaseToAdd, ...purchaseData]);
    
    // Update inventory
    updateInventoryFromPurchase(purchaseToAdd);

    // Reset form and close dialog
    setSupplierName('');
    setProducts([
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    ]);
    setNewPurchaseDialogOpen(false);
    
    toast({
      title: "Purchase Added",
      description: `Purchase ${purchaseToAdd.purchaseId} has been added`
    });
  };

  // Edit product dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editProducts, setEditProducts] = useState<PurchaseItem[]>([
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
  ]);

  const handleEditProduct = (index: number, field: "productName" | "quantity" | "purchasePrice", value: string) => {
    const updatedEditProducts = [...editProducts];
    
    if (field === "productName") {
      // Update product name
      const productId = parseInt(value);
      const product = availableProducts.find((p) => p.productId === productId);
      if (product) {
        updatedEditProducts[index] = {
          ...updatedEditProducts[index],
          productId: product.productId,
          productName: product.productName,
          purchasePrice: product.defaultSalesPrice,
        };
      }
    } else if (field === "quantity") {
      // Update quantity
      updatedEditProducts[index] = {
        ...updatedEditProducts[index],
        quantity: parseInt(value) || 0,
      };
    } else if (field === "purchasePrice") {
      // Update purchase price
      updatedEditProducts[index] = {
        ...updatedEditProducts[index],
        purchasePrice: parseFloat(value) || 0,
      };
    }
    
    setEditProducts(updatedEditProducts);
  };

  const addEditProductRow = () => {
    setEditProducts([
      ...editProducts,
      { productId: 0, productName: "", quantity: 0, purchasePrice: 0 },
    ]);
  };

  const removeEditProductRow = (index: number) => {
    const updatedEditProducts = [...editProducts];
    updatedEditProducts.splice(index, 1);
    setEditProducts(updatedEditProducts);
  };

  const calculateEditTotalAmount = () => {
    return editProducts.reduce((total, product) => {
      return total + (product.purchasePrice * product.quantity);
    }, 0);
  };

  const editPurchase = async () => {
    // Validate fields
    if (!supplierName) {
      toast({
        title: "Validation Error",
        description: "Please enter the supplier name.",
        variant: "destructive"
      });
      return;
    }

    // Filter out products with no product name or zero quantity
    const validProducts = editProducts.filter(
      p => p.productName && p.quantity > 0 && p.purchasePrice > 0
    );

    if (validProducts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product with valid quantity and price.",
        variant: "destructive"
      });
      return;
    }

    // Update purchase with edited values
    if (editedRow) {
      const totalAmount = calculateEditTotalAmount();
      const purchaseToUpdate: PurchaseType = {
        ...editedRow,
        supplierName: supplierName,
        products: validProducts,
        totalAmount: totalAmount,
      };

      const updatedPurchases = purchaseData.map(item =>
        item.purchaseId === editedRow.purchaseId ? purchaseToUpdate : item
      );

      setPurchaseData(updatedPurchases);
      setEditedRow(null);
      setEditDialogOpen(false);

      toast({
        title: "Purchase Updated",
        description: `Purchase ${purchaseToUpdate.purchaseId} has been updated`
      });
    }
  };

  return (
    <div>
      <PageHeader 
        title="Purchase Management" 
        subtitle="Track incoming stock and supplier details"
        actions={
          <>
            <Dialog open={newPurchaseDialogOpen} onOpenChange={setNewPurchaseDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Purchase
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Purchase</DialogTitle>
                  <DialogDescription>
                    Enter details for the new purchase to add to inventory.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supplier Name</label>
                    <Input
                      placeholder="Enter supplier name"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Products</label>
                    {products.map((product, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center">
                        <Select
                          value={product.productName}
                          onValueChange={(value) => handleProductChange(index, "productName", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((p) => (
                              <SelectItem key={p.productId} value={p.productId.toString()}>
                                {p.productName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={product.quantity ? product.quantity.toString() : ""}
                          onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Purchase Price"
                          value={product.purchasePrice ? product.purchasePrice.toString() : ""}
                          onChange={(e) => handleProductChange(index, "purchasePrice", e.target.value)}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeProductRow(index)} className="text-red-500 hover:text-red-700">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addProductRow}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Product
                    </Button>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewPurchaseDialogOpen(false)}>Cancel</Button>
                  <Button onClick={addNewPurchase}>Add Purchase</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Purchase</DialogTitle>
                  <DialogDescription>
                    Edit details for the purchase.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Supplier Name</label>
                    <Input
                      placeholder="Enter supplier name"
                      value={supplierName}
                      onChange={(e) => setSupplierName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Products</label>
                    {editProducts.map((product, index) => (
                      <div key={index} className="grid grid-cols-4 gap-4 items-center">
                        <Select
                          value={product.productName}
                          onValueChange={(value) => handleEditProduct(index, "productName", value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableProducts.map((p) => (
                              <SelectItem key={p.productId} value={p.productId.toString()}>
                                {p.productName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Quantity"
                          value={product.quantity ? product.quantity.toString() : ""}
                          onChange={(e) => handleEditProduct(index, "quantity", e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Purchase Price"
                          value={product.purchasePrice ? product.purchasePrice.toString() : ""}
                          onChange={(e) => handleEditProduct(index, "purchasePrice", e.target.value)}
                        />
                        <Button variant="ghost" size="sm" onClick={() => removeEditProductRow(index)} className="text-red-500 hover:text-red-700">
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addEditProductRow}>
                      <PlusCircle className="h-4 w-4 mr-2" /> Add Product
                    </Button>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                  <Button onClick={editPurchase}>Edit Purchase</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={toggleEditMode}
              disabled={editedRow !== null}
            >
              {editMode ? "Save All" : "Edit Purchase"}
            </Button>
          </>
        }
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex mb-6">
            <div className="relative w-full max-w-sm">
              {/* Search Icon */}
              <Input
                placeholder="Search purchases..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <DataTable
            data={filteredPurchases}
            columns={columns}
            emptyMessage="No purchases found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchase;
