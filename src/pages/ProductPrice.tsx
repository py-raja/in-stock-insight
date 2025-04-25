
import React, { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import PageHeader from '@/components/common/PageHeader';
import { customers, productPrices, Customer, ProductPrice } from '@/services/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ProductPriceTable = () => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [editedPrices, setEditedPrices] = useState<Record<string, number>>({});
  const [products, setProducts] = useState(productPrices);
  const [currentCustomers, setCurrentCustomers] = useState(customers);
  
  // Fetch the latest customer data whenever the component is rendered
  useEffect(() => {
    setCurrentCustomers([...customers]);
  }, []);
  
  const handleEditChange = (productId: number, customerId: number, value: string) => {
    const priceKey = `${productId}-${customerId}`;
    setEditedPrices({
      ...editedPrices,
      [priceKey]: parseFloat(value)
    });
  };

  const getDisplayPrice = (productId: number, customerId: number): number => {
    const priceKey = `${productId}-${customerId}`;
    if (priceKey in editedPrices) {
      return editedPrices[priceKey];
    }
    
    const product = products.find(p => p.productId === productId);
    return product && product.prices[customerId] ? product.prices[customerId] : 0;
  };

  const saveChanges = () => {
    // Update the products with edited prices
    const updatedProducts = products.map(product => {
      const updatedPrices = { ...product.prices };
      
      // For each customer, check if there's an edited price for this product
      currentCustomers.forEach(customer => {
        const priceKey = `${product.productId}-${customer.customerId}`;
        if (priceKey in editedPrices) {
          updatedPrices[customer.customerId] = editedPrices[priceKey];
        }
      });
      
      return {
        ...product,
        prices: updatedPrices
      };
    });
    
    setProducts(updatedProducts);
    setEditedPrices({});
    setEditMode(false);
    
    toast({
      title: "Prices Updated",
      description: "Product prices have been updated successfully"
    });
  };

  const cancelEdit = () => {
    setEditedPrices({});
    setEditMode(false);
  };

  // New product dialog state
  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    defaultPrice: 0
  });

  const handleNewProductChange = (field: string, value: string) => {
    setNewProduct({
      ...newProduct,
      [field]: field === 'productName' ? value : parseFloat(value)
    });
  };

  const addNewProduct = () => {
    // Validate fields
    if (!newProduct.productName || newProduct.defaultPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive"
      });
      return;
    }

    // Create new product with next available ID
    const nextId = Math.max(...products.map(p => p.productId)) + 1;
    
    // Create prices for all customers
    const newPrices: Record<number, number> = {};
    currentCustomers.forEach(customer => {
      newPrices[customer.customerId] = newProduct.defaultPrice;
    });
    
    const productToAdd: ProductPrice = {
      productId: nextId,
      productName: newProduct.productName,
      prices: newPrices
    };

    // Add to products
    setProducts([...products, productToAdd]);
    
    // Reset form and close dialog
    setNewProduct({
      productName: '',
      defaultPrice: 0
    });
    setNewProductDialogOpen(false);
    
    toast({
      title: "Product Added",
      description: `${productToAdd.productName} has been added successfully`
    });
  };

  return (
    <div>
      <PageHeader 
        title="Product Pricing" 
        subtitle="Set and update product pricing for each customer"
        actions={
          <>
            <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
              <DialogTrigger asChild>
                <Button>Add New Product</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter details for the new product to add to price list.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Product Name</label>
                    <Input
                      placeholder="Enter product name"
                      value={newProduct.productName}
                      onChange={(e) => handleNewProductChange('productName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Default Price for All Customers</label>
                    <Input
                      type="number"
                      placeholder="Enter default price"
                      value={newProduct.defaultPrice || ""}
                      onChange={(e) => handleNewProductChange('defaultPrice', e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewProductDialogOpen(false)}>Cancel</Button>
                  <Button onClick={addNewProduct}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {editMode ? (
              <div className="space-x-2">
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={saveChanges}>
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button onClick={() => setEditMode(true)}>
                Edit Prices
              </Button>
            )}
          </>
        }
      />
      
      <Card>
        <CardContent className="pt-6 overflow-auto">
          <div className="min-w-[800px]">
            <table className="min-w-full divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                    style={{ minWidth: '200px' }}
                  >
                    Products / Customers
                  </th>
                  {currentCustomers.map(customer => (
                    <th 
                      key={customer.customerId}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r"
                      style={{ minWidth: '150px' }}
                    >
                      {customer.customerName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product.productId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                      {product.productName}
                    </td>
                    {currentCustomers.map(customer => {
                      // Check if this customer exists in this product's prices
                      // If not (it's a new customer), initialize with default price
                      if (!product.prices[customer.customerId]) {
                        product.prices[customer.customerId] = product.prices[Object.keys(product.prices)[0]] || 0;
                      }
                      
                      return (
                        <td 
                          key={customer.customerId} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r"
                        >
                          {editMode ? (
                            <Input
                              type="number"
                              value={getDisplayPrice(product.productId, customer.customerId)}
                              onChange={(e) => handleEditChange(
                                product.productId, 
                                customer.customerId, 
                                e.target.value
                              )}
                              className="w-24"
                            />
                          ) : (
                            `₹${getDisplayPrice(product.productId, customer.customerId).toLocaleString()}`
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductPriceTable;
