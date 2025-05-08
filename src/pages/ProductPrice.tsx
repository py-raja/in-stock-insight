
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Save, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PageHeader from '@/components/common/PageHeader';
import TabsContainer from '@/components/common/TabsContent';
import DataTable from '@/components/common/DataTable';
import { 
  customers, 
  suppliers,
  purchaseProducts, 
  salesProducts, 
  getNextProductId
} from '@/services/mockData';
import { PurchaseProduct, SalesProduct } from '@/types/productPrice';

const ProductPriceTable = () => {
  const { toast } = useToast();
  
  // Purchase product state
  const [purchaseProductsData, setPurchaseProductsData] = useState<PurchaseProduct[]>([...purchaseProducts]);
  const [editPurchaseMode, setEditPurchaseMode] = useState(false);
  const [editedPurchasePrices, setEditedPurchasePrices] = useState<Record<number, number>>({});
  
  // Sales product state
  const [salesProductsData, setSalesProductsData] = useState<SalesProduct[]>([...salesProducts]);
  const [editSalesMode, setEditSalesMode] = useState(false);
  const [editedSalesPrices, setEditedSalesPrices] = useState<Record<string, number>>({});
  
  // Current customers and suppliers
  const [currentCustomers, setCurrentCustomers] = useState(customers);
  const [currentSuppliers, setCurrentSuppliers] = useState(suppliers);
  
  // New product dialog state
  const [newProductDialogOpen, setNewProductDialogOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    supplierId: '',
    productName: '',
    productWeight: '',
    incentiveAmount: 0,
    purchaseRate: 0,
    productType: '',
    defaultSalesPrice: 0
  });
  
  // Search state
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [salesSearch, setSalesSearch] = useState('');
  
  // Fetch the latest customer and supplier data whenever the component is rendered
  useEffect(() => {
    setCurrentCustomers([...customers]);
    setCurrentSuppliers([...suppliers]);
  }, []);
  
  // Filtered products based on search
  const filteredPurchaseProducts = purchaseProductsData.filter(product =>
    product.productName.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    product.supplierName.toLowerCase().includes(purchaseSearch.toLowerCase()) ||
    product.productType.toLowerCase().includes(purchaseSearch.toLowerCase())
  );
  
  const filteredSalesProducts = salesProductsData.filter(product =>
    product.productName.toLowerCase().includes(salesSearch.toLowerCase())
  );
  
  // Handle purchase price change
  const handlePurchaseEditChange = (productId: number, value: string) => {
    setEditedPurchasePrices({
      ...editedPurchasePrices,
      [productId]: parseFloat(value)
    });
  };
  
  // Handle sales price change
  const handleSalesEditChange = (productId: number, customerId: number, value: string) => {
    const priceKey = `${productId}-${customerId}`;
    setEditedSalesPrices({
      ...editedSalesPrices,
      [priceKey]: parseFloat(value)
    });
  };
  
  // Get display price for purchase products
  const getPurchaseDisplayPrice = (productId: number): number => {
    if (productId in editedPurchasePrices) {
      return editedPurchasePrices[productId];
    }
    
    const product = purchaseProductsData.find(p => p.productId === productId);
    return product ? product.purchaseRate : 0;
  };
  
  // Get display price for sales products
  const getSalesDisplayPrice = (productId: number, customerId: number): number => {
    const priceKey = `${productId}-${customerId}`;
    if (priceKey in editedSalesPrices) {
      return editedSalesPrices[priceKey];
    }
    
    const product = salesProductsData.find(p => p.productId === productId);
    return product && product.customerPrices[customerId] ? product.customerPrices[customerId] : 0;
  };
  
  // Save purchase price changes
  const savePurchaseChanges = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const updatedProducts = purchaseProductsData.map(product => {
      if (product.productId in editedPurchasePrices) {
        const newPrice = editedPurchasePrices[product.productId];
        return {
          ...product,
          purchaseRate: newPrice,
          priceHistory: [
            ...product.priceHistory,
            { date: today, price: newPrice }
          ]
        };
      }
      return product;
    });
    
    setPurchaseProductsData(updatedProducts);
    setEditedPurchasePrices({});
    setEditPurchaseMode(false);
    
    toast({
      title: "Purchase Prices Updated",
      description: "Product purchase prices have been updated successfully"
    });
  };
  
  // Save sales price changes
  const saveSalesChanges = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    // Group by product ID to track if default price changed
    const priceChangesByProduct: Record<number, {
      defaultChanged: boolean,
      newCustomerPrices: Record<number, number>
    }> = {};
    
    // Initialize the structure with existing products
    salesProductsData.forEach(product => {
      priceChangesByProduct[product.productId] = {
        defaultChanged: false,
        newCustomerPrices: { ...product.customerPrices }
      };
    });
    
    // Process all edited prices
    Object.entries(editedSalesPrices).forEach(([key, price]) => {
      const [productId, customerId] = key.split('-').map(Number);
      
      if (!priceChangesByProduct[productId]) {
        priceChangesByProduct[productId] = {
          defaultChanged: false,
          newCustomerPrices: {}
        };
      }
      
      priceChangesByProduct[productId].newCustomerPrices[customerId] = price;
    });
    
    // Update products with new prices
    const updatedProducts = salesProductsData.map(product => {
      const changes = priceChangesByProduct[product.productId];
      if (changes) {
        const newPriceHistory = [...product.priceHistory];
        
        // Check if default price changed
        const defaultPriceChange = changes.newCustomerPrices[0];
        if (defaultPriceChange) {
          newPriceHistory.push({ date: today, price: defaultPriceChange });
        }
        
        return {
          ...product,
          defaultSalesPrice: defaultPriceChange || product.defaultSalesPrice,
          customerPrices: changes.newCustomerPrices,
          priceHistory: newPriceHistory
        };
      }
      return product;
    });
    
    setSalesProductsData(updatedProducts);
    setEditedSalesPrices({});
    setEditSalesMode(false);
    
    toast({
      title: "Sales Prices Updated",
      description: "Product sales prices have been updated successfully"
    });
  };
  
  // Cancel edit mode for purchase
  const cancelPurchaseEdit = () => {
    setEditedPurchasePrices({});
    setEditPurchaseMode(false);
  };
  
  // Cancel edit mode for sales
  const cancelSalesEdit = () => {
    setEditedSalesPrices({});
    setEditSalesMode(false);
  };
  
  // Handle new product input changes
  const handleNewProductChange = (field: string, value: string | number) => {
    setNewProduct({
      ...newProduct,
      [field]: field === 'productName' || field === 'productWeight' || field === 'productType' 
        ? value 
        : parseFloat(value as string) || 0
    });
  };
  
  // Add new product
  const addNewProduct = () => {
    // Validate fields
    if (
      !newProduct.supplierId || 
      !newProduct.productName || 
      !newProduct.productWeight || 
      !newProduct.productType || 
      newProduct.purchaseRate <= 0 ||
      newProduct.defaultSalesPrice <= 0
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields correctly",
        variant: "destructive"
      });
      return;
    }
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const nextId = getNextProductId();
    const supplierId = parseInt(newProduct.supplierId);
    const supplier = suppliers.find(s => s.supplierId === supplierId);
    
    // Create new purchase product
    const purchaseProductToAdd: PurchaseProduct = {
      productId: nextId,
      supplierId: supplierId,
      supplierName: supplier ? supplier.supplierName : "Unknown Supplier",
      productName: newProduct.productName,
      productWeight: newProduct.productWeight,
      incentiveAmount: newProduct.incentiveAmount,
      purchaseRate: newProduct.purchaseRate,
      productType: newProduct.productType,
      priceHistory: [
        { date: today, price: newProduct.purchaseRate }
      ]
    };
    
    // Create customer prices (all customers get default price)
    const customerPrices: Record<number, number> = {};
    customers.forEach(customer => {
      customerPrices[customer.customerId] = newProduct.defaultSalesPrice;
    });
    
    // Create new sales product
    const salesProductToAdd: SalesProduct = {
      productId: nextId,
      productName: newProduct.productName,
      defaultSalesPrice: newProduct.defaultSalesPrice,
      priceHistory: [
        { date: today, price: newProduct.defaultSalesPrice }
      ],
      customerPrices: customerPrices
    };
    
    // Add to products lists
    setPurchaseProductsData([purchaseProductToAdd, ...purchaseProductsData]);
    setSalesProductsData([salesProductToAdd, ...salesProductsData]);
    
    // Reset form and close dialog
    setNewProduct({
      supplierId: '',
      productName: '',
      productWeight: '',
      incentiveAmount: 0,
      purchaseRate: 0,
      productType: '',
      defaultSalesPrice: 0
    });
    setNewProductDialogOpen(false);
    
    toast({
      title: "Product Added",
      description: `${newProduct.productName} has been added successfully`
    });
  };
  
  // Purchase product columns for DataTable
  const purchaseProductColumns = [
    { header: 'ID', accessorKey: 'productId' },
    { header: 'Supplier', accessorKey: 'supplierName' },
    { header: 'Product Name', accessorKey: 'productName' },
    { header: 'Weight', accessorKey: 'productWeight' },
    { header: 'Incentive (Per Ltr)', accessorKey: 'incentiveAmount' },
    { 
      header: 'Purchase Rate', 
      accessorKey: (row: PurchaseProduct) => {
        if (editPurchaseMode) {
          return (
            <Input
              type="number"
              value={getPurchaseDisplayPrice(row.productId)}
              onChange={(e) => handlePurchaseEditChange(row.productId, e.target.value)}
              className="w-24"
            />
          );
        }
        return `₹${row.purchaseRate}`;
      }
    },
    { header: 'Product Type', accessorKey: 'productType' }
  ];
  
  // Purchase products tab content
  const purchaseProductsTab = (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={purchaseSearch}
            onChange={(e) => setPurchaseSearch(e.target.value)}
          />
        </div>
        
        <div className="space-x-2">
          {editPurchaseMode ? (
            <>
              <Button variant="outline" onClick={cancelPurchaseEdit}>
                Cancel
              </Button>
              <Button onClick={savePurchaseChanges}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditPurchaseMode(true)}>
              Edit Prices
            </Button>
          )}
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="pt-6">
          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <DataTable
              data={filteredPurchaseProducts}
              columns={purchaseProductColumns}
              emptyMessage="No products found"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  // Sales products tab content
  const salesProductsTab = (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={salesSearch}
            onChange={(e) => setSalesSearch(e.target.value)}
          />
        </div>
        
        <div className="space-x-2">
          {editSalesMode ? (
            <>
              <Button variant="outline" onClick={cancelSalesEdit}>
                Cancel
              </Button>
              <Button onClick={saveSalesChanges}>
                <Save className="h-4 w-4 mr-2" /> Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setEditSalesMode(true)}>
              Edit Prices
            </Button>
          )}
        </div>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-auto max-h-[calc(100vh-300px)]">
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
                {filteredSalesProducts.map(product => (
                  <tr key={product.productId}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">
                      {product.productName}
                    </td>
                    {currentCustomers.map(customer => {
                      return (
                        <td 
                          key={customer.customerId} 
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r"
                        >
                          {editSalesMode ? (
                            <Input
                              type="number"
                              value={getSalesDisplayPrice(product.productId, customer.customerId)}
                              onChange={(e) => handleSalesEditChange(
                                product.productId, 
                                customer.customerId, 
                                e.target.value
                              )}
                              className="w-24"
                            />
                          ) : (
                            `₹${getSalesDisplayPrice(product.productId, customer.customerId).toLocaleString()}`
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
  
  // Add new product tab content
  const addNewProductTab = (
    <div>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            <Button onClick={() => setNewProductDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" /> Add New Product
            </Button>
          </div>

          {/* New product instructions */}
          <div className="bg-muted/50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-2">Adding New Products</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Click the "Add New Product" button above to add a new product</li>
              <li>Fill in all required details including supplier, product name, weight, and pricing</li>
              <li>The product ID will be automatically generated</li>
              <li>Purchase rate and default sales price will be saved with the current date</li>
              <li>Default sales price will automatically apply to all customers</li>
              <li>You can later customize prices for specific customers in the Sales Product Details tab</li>
            </ul>
          </div>

          {/* Product table for reference */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Current Products</h3>
            <DataTable
              data={salesProductsData}
              columns={[
                { header: 'ID', accessorKey: 'productId' },
                { header: 'Product Name', accessorKey: 'productName' },
                { header: 'Default Sales Price', accessorKey: (row: SalesProduct) => `₹${row.defaultSalesPrice}` }
              ]}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Add New Product Dialog */}
      <Dialog open={newProductDialogOpen} onOpenChange={setNewProductDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter details for the new product.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                <Select 
                  value={newProduct.supplierId.toString()} 
                  onValueChange={(value) => handleNewProductChange('supplierId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentSuppliers.map(supplier => (
                      <SelectItem 
                        key={supplier.supplierId} 
                        value={supplier.supplierId.toString()}
                      >
                        {supplier.supplierName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <label className="text-sm font-medium">Product Weight</label>
                <Input
                  placeholder="e.g., 500ml, 1kg"
                  value={newProduct.productWeight}
                  onChange={(e) => handleNewProductChange('productWeight', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Incentive Amount (Per Ltr)</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProduct.incentiveAmount || ""}
                  onChange={(e) => handleNewProductChange('incentiveAmount', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase Rate</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProduct.purchaseRate || ""}
                  onChange={(e) => handleNewProductChange('purchaseRate', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Type</label>
                <Input
                  placeholder="e.g., Dairy, Beverage"
                  value={newProduct.productType}
                  onChange={(e) => handleNewProductChange('productType', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Sales Price</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newProduct.defaultSalesPrice || ""}
                  onChange={(e) => handleNewProductChange('defaultSalesPrice', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewProductDialogOpen(false)}>Cancel</Button>
            <Button onClick={addNewProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  return (
    <div>
      <PageHeader 
        title="Product Pricing" 
        subtitle="Manage purchase and sales pricing for products"
      />
      
      <TabsContainer 
        tabs={[
          {
            value: "purchase",
            label: "Purchase Product Details",
            content: purchaseProductsTab
          },
          {
            value: "sales",
            label: "Sales Product Details",
            content: salesProductsTab
          },
          {
            value: "add",
            label: "Add New Product",
            content: addNewProductTab
          }
        ]}
      />
    </div>
  );
};

export default ProductPriceTable;
