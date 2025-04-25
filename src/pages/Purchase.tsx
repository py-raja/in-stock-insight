
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Save, Trash, Edit, Calendar } from 'lucide-react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import TabsContainer from '@/components/common/TabsContent';
import { 
  purchases, 
  getNextPurchaseId, 
  getCompanyNames,
  getProductsByCompany,
  Product,
  getPurchaseById
} from '@/services/mockData';

interface PurchaseProduct {
  productId: number;
  productName: string;
  purchasePrice: number;
  quantity: number;
}

interface PurchaseForm {
  purchaseId: string;
  companyName: string;
  purchaseDate: Date;
  products: PurchaseProduct[];
}

const PurchaseDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('purchaseId');

  const filteredPurchases = purchases.filter(purchase => {
    const searchValue = purchase[searchBy as keyof typeof purchase];
    if (typeof searchValue === 'string') {
      return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  });

  const columns = [
    { header: 'Purchase ID', accessorKey: 'purchaseId' },
    { header: 'Company Name', accessorKey: 'companyName' },
    { header: 'Purchase Date', accessorKey: 'purchaseDate' },
    { 
      header: 'Products', 
      accessorKey: (row) => `${row.products.length} items` 
    },
    { 
      header: 'Total Amount', 
      accessorKey: (row) => {
        const total = row.products.reduce(
          (sum, product) => sum + (product.purchasePrice * product.quantity), 
          0
        );
        return `₹${total.toLocaleString()}`;
      } 
    },
    {
      header: 'Actions',
      accessorKey: (row) => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-1" /> View
          </Button>
        </div>
      ),
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Select
              value={searchBy}
              onValueChange={setSearchBy}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Search by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="purchaseId">Purchase ID</SelectItem>
                <SelectItem value="companyName">Company Name</SelectItem>
                <SelectItem value="purchaseDate">Purchase Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search purchases..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DataTable
          data={filteredPurchases}
          columns={columns}
          emptyMessage="No purchase records found"
        />
      </CardContent>
    </Card>
  );
};

const AddNewPurchase = () => {
  const { toast } = useToast();
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm>({
    purchaseId: getNextPurchaseId(),
    companyName: '',
    purchaseDate: new Date(),
    products: Array(5).fill({
      productId: 0,
      productName: '',
      purchasePrice: 0,
      quantity: 0
    })
  });
  
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const companyNames = getCompanyNames();

  const handleCompanyChange = (value: string) => {
    setPurchaseForm({
      ...purchaseForm,
      companyName: value,
      products: Array(5).fill({
        productId: 0,
        productName: '',
        purchasePrice: 0,
        quantity: 0
      })
    });
    
    // Get products for this company
    const products = getProductsByCompany(value);
    setAvailableProducts(products);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setPurchaseForm({
        ...purchaseForm,
        purchaseDate: date
      });
    }
  };

  const handleProductChange = (index: number, field: keyof PurchaseProduct, value: any) => {
    const updatedProducts = [...purchaseForm.products];
    
    if (field === 'productId') {
      const selectedProduct = availableProducts.find(p => p.productId === parseInt(value));
      if (selectedProduct) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          productId: selectedProduct.productId,
          productName: selectedProduct.productName,
          purchasePrice: 0,
          quantity: 0
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === 'productId' ? parseInt(value) : parseFloat(value)
      };
    }
    
    setPurchaseForm({
      ...purchaseForm,
      products: updatedProducts
    });
  };

  const addRow = () => {
    setPurchaseForm({
      ...purchaseForm,
      products: [
        ...purchaseForm.products,
        { productId: 0, productName: '', purchasePrice: 0, quantity: 0 }
      ]
    });
  };

  const removeRow = (index: number) => {
    const updatedProducts = [...purchaseForm.products];
    updatedProducts.splice(index, 1);
    setPurchaseForm({
      ...purchaseForm,
      products: updatedProducts
    });
  };

  const handleSubmit = () => {
    // Filter out empty products
    const validProducts = purchaseForm.products.filter(
      p => p.productId !== 0 && p.purchasePrice > 0 && p.quantity > 0
    );
    
    if (validProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid product",
        variant: "destructive"
      });
      return;
    }
    
    if (!purchaseForm.companyName) {
      toast({
        title: "Error",
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally send data to your backend
    toast({
      title: "Purchase Added",
      description: `Purchase ID: ${purchaseForm.purchaseId} has been added successfully`,
    });
    
    // Reset form
    setPurchaseForm({
      purchaseId: getNextPurchaseId(),
      companyName: '',
      purchaseDate: new Date(),
      products: Array(5).fill({
        productId: 0,
        productName: '',
        purchasePrice: 0,
        quantity: 0
      })
    });
    setAvailableProducts([]);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="purchaseId">Purchase ID</Label>
              <Input
                id="purchaseId"
                value={purchaseForm.purchaseId}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company Name</Label>
              <Select
                value={purchaseForm.companyName}
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companyNames.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Purchase Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(purchaseForm.purchaseDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={purchaseForm.purchaseDate}
                    onSelect={handleDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div>
            <div className="font-medium mb-2">Products</div>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchaseForm.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={product.productId ? String(product.productId) : ""}
                          onValueChange={(value) => handleProductChange(index, 'productId', value)}
                          disabled={!purchaseForm.companyName}
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          value={product.purchasePrice || ""}
                          onChange={(e) => handleProductChange(index, 'purchasePrice', e.target.value)}
                          placeholder="Price"
                          disabled={!product.productId}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          value={product.quantity || ""}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                          placeholder="Qty"
                          disabled={!product.productId}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(product.purchasePrice * product.quantity).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeRow(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-between">
              <Button variant="outline" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
              
              <div className="text-right">
                <div className="text-gray-500 text-sm mb-1">
                  Total Amount: <span className="font-bold">₹
                    {purchaseForm.products.reduce(
                      (sum, p) => sum + (p.purchasePrice * p.quantity), 
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <Button onClick={handleSubmit}>
                  <Save className="h-4 w-4 mr-2" /> Save Purchase
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModifyPurchase = () => {
  const { toast } = useToast();
  const [searchId, setSearchId] = useState('');
  const [purchaseForm, setPurchaseForm] = useState<PurchaseForm | null>(null);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  const handleSearch = () => {
    const purchase = getPurchaseById(searchId);
    
    if (purchase) {
      setPurchaseForm({
        purchaseId: purchase.purchaseId,
        companyName: purchase.companyName,
        purchaseDate: new Date(purchase.purchaseDate),
        products: purchase.products
      });
      
      // Get products for this company
      const products = getProductsByCompany(purchase.companyName);
      setAvailableProducts(products);
    } else {
      toast({
        title: "Not Found",
        description: `Purchase ID: ${searchId} not found`,
        variant: "destructive"
      });
      setPurchaseForm(null);
    }
  };

  const handleProductChange = (index: number, field: keyof PurchaseProduct, value: any) => {
    if (!purchaseForm) return;
    
    const updatedProducts = [...purchaseForm.products];
    
    if (field === 'productId') {
      const selectedProduct = availableProducts.find(p => p.productId === parseInt(value));
      if (selectedProduct) {
        updatedProducts[index] = {
          ...updatedProducts[index],
          productId: selectedProduct.productId,
          productName: selectedProduct.productName,
          purchasePrice: updatedProducts[index].purchasePrice,
          quantity: updatedProducts[index].quantity
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === 'productId' ? parseInt(value) : parseFloat(value)
      };
    }
    
    setPurchaseForm({
      ...purchaseForm,
      products: updatedProducts
    });
  };

  const addRow = () => {
    if (!purchaseForm) return;
    
    setPurchaseForm({
      ...purchaseForm,
      products: [
        ...purchaseForm.products,
        { productId: 0, productName: '', purchasePrice: 0, quantity: 0 }
      ]
    });
  };

  const removeRow = (index: number) => {
    if (!purchaseForm) return;
    
    const updatedProducts = [...purchaseForm.products];
    updatedProducts.splice(index, 1);
    setPurchaseForm({
      ...purchaseForm,
      products: updatedProducts
    });
  };

  const handleSubmit = () => {
    if (!purchaseForm) return;
    
    // Filter out empty products
    const validProducts = purchaseForm.products.filter(
      p => p.productId !== 0 && p.purchasePrice > 0 && p.quantity > 0
    );
    
    if (validProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one valid product",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would normally update data in your backend
    toast({
      title: "Purchase Updated",
      description: `Purchase ID: ${purchaseForm.purchaseId} has been updated successfully`,
    });
    
    // Reset form
    setPurchaseForm(null);
    setSearchId('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Purchase ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" /> Find
            </Button>
          </div>
        </div>
        
        {purchaseForm && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="purchaseId">Purchase ID</Label>
                <Input
                  id="purchaseId"
                  value={purchaseForm.purchaseId}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="company">Company Name</Label>
                <Input
                  id="company"
                  value={purchaseForm.companyName}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            </div>
            
            <div>
              <div className="font-medium mb-2">Products</div>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {purchaseForm.products.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={product.productId ? String(product.productId) : ""}
                            onValueChange={(value) => handleProductChange(index, 'productId', value)}
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="number"
                            value={product.purchasePrice || ""}
                            onChange={(e) => handleProductChange(index, 'purchasePrice', e.target.value)}
                            placeholder="Price"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="number"
                            value={product.quantity || ""}
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{(product.purchasePrice * product.quantity).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={addRow}>
                  <Plus className="h-4 w-4 mr-2" /> Add Row
                </Button>
                
                <div className="text-right">
                  <div className="text-gray-500 text-sm mb-1">
                    Total Amount: <span className="font-bold">₹
                      {purchaseForm.products.reduce(
                        (sum, p) => sum + (p.purchasePrice * p.quantity), 
                        0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={() => setPurchaseForm(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      <Save className="h-4 w-4 mr-2" /> Update Purchase
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const Purchase = () => {
  const tabs = [
    {
      value: 'details',
      label: 'Purchase Details',
      content: <PurchaseDetails />,
    },
    {
      value: 'add',
      label: 'Add New',
      content: <AddNewPurchase />,
    },
    {
      value: 'modify',
      label: 'Modify',
      content: <ModifyPurchase />,
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Purchase Management" 
        subtitle="Manage supplier information and purchase orders"
      />
      
      <TabsContainer tabs={tabs} />
    </div>
  );
};

export default Purchase;
