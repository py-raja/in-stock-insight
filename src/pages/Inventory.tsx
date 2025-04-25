import React, { useState } from 'react';
import { Search, PlusCircle, Save, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { products, Product } from '@/services/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Inventory = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [inventoryData, setInventoryData] = useState<Product[]>([...products].sort(
    (a, b) => b.availableQuantity - a.availableQuantity
  ));
  const [editedRow, setEditedRow] = useState<Product | null>(null);
  
  const filteredProducts = inventoryData.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.companyName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditedRow({ ...product });
  };

  const saveChanges = () => {
    if (editedRow) {
      const updatedInventory = inventoryData.map(item =>
        item.productId === editedRow.productId ? editedRow : item
      );
      setInventoryData(updatedInventory);
      setEditedRow(null);
      
      toast({
        title: "Inventory Updated",
        description: `${editedRow.productName} has been updated successfully`,
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

  const handleInputChange = (field: keyof Product, value: string | number) => {
    if (editedRow) {
      setEditedRow({
        ...editedRow,
        [field]: typeof value === 'string' && !isNaN(Number(value)) 
          ? parseFloat(value) 
          : value
      });
    }
  };

  const columns = [
    { 
      header: 'Product ID', 
      accessorKey: 'productId' as keyof Product
    },
    { 
      header: 'Company Name', 
      accessorKey: 'companyName' as keyof Product
    },
    { 
      header: 'Product Name', 
      accessorKey: 'productName' as keyof Product 
    },
    { 
      header: 'Available Qty', 
      accessorKey: (row: Product) => {
        // If this row is being edited, show an input
        if (editMode && editedRow && editedRow.productId === row.productId) {
          return (
            <Input
              type="number"
              value={editedRow.availableQuantity}
              onChange={(e) => handleInputChange('availableQuantity', e.target.value)}
              className="w-20"
            />
          );
        }
        // Otherwise show the value
        return row.availableQuantity;
      }
    },
    { 
      header: 'Ordered Qty', 
      accessorKey: (row: Product) => {
        if (editMode && editedRow && editedRow.productId === row.productId) {
          return (
            <Input
              type="number"
              value={editedRow.orderedQuantity}
              onChange={(e) => handleInputChange('orderedQuantity', e.target.value)}
              className="w-20"
            />
          );
        }
        return row.orderedQuantity;
      }
    },
    { 
      header: 'Actual Qty', 
      accessorKey: (row: Product) => {
        const actual = row.availableQuantity - row.orderedQuantity;
        return (
          <span className={actual < 0 ? 'text-red-500' : 'text-green-500'}>
            {actual}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      accessorKey: (row: Product) => {
        if (editMode) {
          if (editedRow && editedRow.productId === row.productId) {
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

  // New product dialog state
  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    companyName: '',
    productName: '',
    defaultSalesPrice: 0,
    availableQuantity: 0,
    orderedQuantity: 0
  });

  const handleNewProductChange = (field: string, value: string) => {
    setNewProduct({
      ...newProduct,
      [field]: field === 'companyName' || field === 'productName' 
        ? value 
        : parseFloat(value)
    });
  };

  const addNewProduct = () => {
    // Validate fields
    if (!newProduct.companyName || !newProduct.productName || newProduct.defaultSalesPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    // Create new product with next available ID
    const nextId = Math.max(...inventoryData.map(p => p.productId)) + 1;
    const productToAdd: Product = {
      productId: nextId,
      ...newProduct,
      actualQuantity: newProduct.availableQuantity - newProduct.orderedQuantity
    };

    // Add to inventory
    setInventoryData([productToAdd, ...inventoryData]);
    
    // Reset form and close dialog
    setNewProduct({
      companyName: '',
      productName: '',
      defaultSalesPrice: 0,
      availableQuantity: 0,
      orderedQuantity: 0
    });
    setNewProductDialogOpen(false);
    
    toast({
      title: "Product Added",
      description: `${productToAdd.productName} has been added to inventory`
    });
  };

  return (
    <div>
      <PageHeader 
        title="Inventory Management" 
        subtitle="Track stock levels and product details"
        actions={
          <>
            <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter details for the new product to add to inventory.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input
                      placeholder="Enter company name"
                      value={newProduct.companyName}
                      onChange={(e) => handleNewProductChange('companyName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input
                      placeholder="Enter product name"
                      value={newProduct.productName}
                      onChange={(e) => handleNewProductChange('productName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Sales Price</label>
                    <Input
                      type="number"
                      placeholder="Enter default price"
                      value={newProduct.defaultSalesPrice || ""}
                      onChange={(e) => handleNewProductChange('defaultSalesPrice', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Available Quantity</label>
                    <Input
                      type="number"
                      placeholder="Enter available quantity"
                      value={newProduct.availableQuantity || ""}
                      onChange={(e) => handleNewProductChange('availableQuantity', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ordered Quantity</label>
                    <Input
                      type="number"
                      placeholder="Enter ordered quantity"
                      value={newProduct.orderedQuantity || ""}
                      onChange={(e) => handleNewProductChange('orderedQuantity', e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewProductDialogOpen(false)}>Cancel</Button>
                  <Button onClick={addNewProduct}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button
              variant={editMode ? "default" : "outline"}
              onClick={toggleEditMode}
            >
              {editMode ? "Save All" : "Edit Inventory"}
            </Button>
          </>
        }
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <DataTable
            data={filteredProducts}
            columns={columns}
            emptyMessage="No products found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
