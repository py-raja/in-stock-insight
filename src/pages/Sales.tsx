
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Trash, Calendar, Save, Edit } from 'lucide-react';
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
  customers, 
  products, 
  getCustomerProductPrice,
  getNextSalesId,
  sales,
  SalesTransaction,
  getSaleById
} from '@/services/mockData';

interface SalesProduct {
  productId: number;
  productName: string;
  salesPrice: number;
  quantity: number;
}

interface SalesForm {
  salesId: string;
  date: Date;
  customerId: number;
  customerName: string;
  products: SalesProduct[];
  amountPaid: number;
  totalAmount: number;
}

// First tab: Sales Details component
const SalesDetails = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('salesId');
  const [recentSales, setRecentSales] = useState<SalesTransaction[]>([...sales]);

  const filteredSales = recentSales.filter(sale => {
    const searchValue = sale[searchBy as keyof typeof sale];
    if (typeof searchValue === 'string') {
      return searchValue.toLowerCase().includes(searchTerm.toLowerCase());
    } else if (searchBy === 'products' && Array.isArray(sale.products)) {
      return sale.products.some(product => 
        product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return false;
  });

  const columns = [
    { header: 'Sales ID', accessorKey: 'salesId' as keyof SalesTransaction },
    { header: 'Date', accessorKey: 'date' as keyof SalesTransaction },
    { header: 'Customer', accessorKey: 'customerName' as keyof SalesTransaction },
    { 
      header: 'Products', 
      accessorKey: (row: SalesTransaction) => `${row.products.length} items` 
    },
    { 
      header: 'Total Amount', 
      accessorKey: (row: SalesTransaction) => `₹${row.totalAmount.toLocaleString()}` 
    },
    { 
      header: 'Paid Amount', 
      accessorKey: (row: SalesTransaction) => `₹${row.amountPaid.toLocaleString()}` 
    },
    { 
      header: 'Balance', 
      accessorKey: (row: SalesTransaction) => {
        const balance = row.totalAmount - row.amountPaid;
        return `₹${balance.toLocaleString()}`;
      } 
    },
    {
      header: 'Actions',
      accessorKey: (row: SalesTransaction) => (
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
                <SelectItem value="salesId">Sales ID</SelectItem>
                <SelectItem value="customerName">Customer Name</SelectItem>
                <SelectItem value="date">Sales Date</SelectItem>
                <SelectItem value="products">Product Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search sales..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <DataTable
          data={filteredSales}
          columns={columns}
          emptyMessage="No sales records found"
        />
      </CardContent>
    </Card>
  );
};

// Second tab: Add New Sales component
const AddNewSale = () => {
  const { toast } = useToast();
  const [salesForm, setSalesForm] = useState<SalesForm>({
    salesId: getNextSalesId(),
    date: new Date(),
    customerId: 0,
    customerName: '',
    products: Array(5).fill({
      productId: 0,
      productName: '',
      salesPrice: 0,
      quantity: 0
    }),
    amountPaid: 0,
    totalAmount: 0
  });
  
  const [recentSales, setRecentSales] = useState<SalesTransaction[]>([...sales]);

  const handleCustomerChange = (customerId: string) => {
    const customerId_num = parseInt(customerId);
    const customer = customers.find(c => c.customerId === customerId_num);
    
    setSalesForm({
      ...salesForm,
      customerId: customerId_num,
      customerName: customer ? customer.customerName : '',
      products: Array(5).fill({
        productId: 0,
        productName: '',
        salesPrice: 0,
        quantity: 0
      }),
      amountPaid: 0,
      totalAmount: 0
    });
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSalesForm({
        ...salesForm,
        date
      });
    }
  };

  const handleProductChange = (index: number, productId: string) => {
    const productId_num = parseInt(productId);
    const product = products.find(p => p.productId === productId_num);
    
    if (product && salesForm.customerId) {
      const price = getCustomerProductPrice(salesForm.customerId, productId_num);
      
      const updatedProducts = [...salesForm.products];
      updatedProducts[index] = {
        productId: productId_num,
        productName: product.productName,
        salesPrice: price,
        quantity: 0
      };
      
      setSalesForm({
        ...salesForm,
        products: updatedProducts,
      });
      
      calculateTotal(updatedProducts);
    }
  };

  const handleQuantityChange = (index: number, quantity: string) => {
    const qty = parseInt(quantity);
    
    const updatedProducts = [...salesForm.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: isNaN(qty) ? 0 : qty
    };
    
    setSalesForm({
      ...salesForm,
      products: updatedProducts,
    });
    
    calculateTotal(updatedProducts);
  };

  const handlePriceChange = (index: number, price: string) => {
    const priceValue = parseFloat(price);
    
    const updatedProducts = [...salesForm.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      salesPrice: isNaN(priceValue) ? 0 : priceValue
    };
    
    setSalesForm({
      ...salesForm,
      products: updatedProducts,
    });
    
    calculateTotal(updatedProducts);
  };

  const calculateTotal = (updatedProducts: SalesProduct[]) => {
    const total = updatedProducts.reduce(
      (sum, product) => sum + (product.salesPrice * product.quantity),
      0
    );
    
    setSalesForm(prevForm => ({
      ...prevForm,
      totalAmount: total
    }));
  };

  const handleAmountPaidChange = (amount: string) => {
    const amountValue = parseFloat(amount);
    
    setSalesForm({
      ...salesForm,
      amountPaid: isNaN(amountValue) ? 0 : amountValue
    });
  };

  const addRow = () => {
    setSalesForm({
      ...salesForm,
      products: [
        ...salesForm.products,
        { productId: 0, productName: '', salesPrice: 0, quantity: 0 }
      ]
    });
  };

  const removeRow = (index: number) => {
    const updatedProducts = [...salesForm.products];
    updatedProducts.splice(index, 1);
    
    setSalesForm({
      ...salesForm,
      products: updatedProducts
    });
    
    calculateTotal(updatedProducts);
  };

  const handleSubmit = () => {
    // Validate customer
    if (!salesForm.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty products
    const validProducts = salesForm.products.filter(
      p => p.productId !== 0 && p.quantity > 0
    );
    
    // Special case: Allow just an amount payment without products
    if (validProducts.length === 0 && salesForm.amountPaid > 0) {
      // Processing payment without products
      const newSale: SalesTransaction = {
        salesId: salesForm.salesId,
        date: format(salesForm.date, 'yyyy-MM-dd'),
        customerId: salesForm.customerId,
        customerName: salesForm.customerName,
        products: [],
        amountPaid: salesForm.amountPaid,
        totalAmount: 0
      };
      
      // Add to sales
      setRecentSales([newSale, ...recentSales]);
      
      toast({
        title: "Payment Recorded",
        description: `Payment of ₹${salesForm.amountPaid.toLocaleString()} has been recorded for ${salesForm.customerName}`
      });
      
      // Reset form
      setSalesForm({
        salesId: getNextSalesId(),
        date: new Date(),
        customerId: 0,
        customerName: '',
        products: Array(5).fill({
          productId: 0,
          productName: '',
          salesPrice: 0,
          quantity: 0
        }),
        amountPaid: 0,
        totalAmount: 0
      });
      
      return;
    }
    
    // Case: Products selected but no amount paid
    if (validProducts.length > 0 && salesForm.amountPaid === 0) {
      const newSale: SalesTransaction = {
        salesId: salesForm.salesId,
        date: format(salesForm.date, 'yyyy-MM-dd'),
        customerId: salesForm.customerId,
        customerName: salesForm.customerName,
        products: validProducts,
        amountPaid: 0,
        totalAmount: salesForm.totalAmount
      };
      
      setRecentSales([newSale, ...recentSales]);
      
      toast({
        title: "Sale Recorded",
        description: `Sale has been recorded and ₹${salesForm.totalAmount.toLocaleString()} added to ${salesForm.customerName}'s balance`
      });
      
      // Reset form
      setSalesForm({
        salesId: getNextSalesId(),
        date: new Date(),
        customerId: 0,
        customerName: '',
        products: Array(5).fill({
          productId: 0,
          productName: '',
          salesPrice: 0,
          quantity: 0
        }),
        amountPaid: 0,
        totalAmount: 0
      });
      
      return;
    }
    
    // Regular case with products and payment
    if (validProducts.length > 0) {
      const newSale: SalesTransaction = {
        salesId: salesForm.salesId,
        date: format(salesForm.date, 'yyyy-MM-dd'),
        customerId: salesForm.customerId,
        customerName: salesForm.customerName,
        products: validProducts,
        amountPaid: salesForm.amountPaid,
        totalAmount: salesForm.totalAmount
      };
      
      setRecentSales([newSale, ...recentSales]);
      
      toast({
        title: "Sale Completed",
        description: `Sales ID: ${salesForm.salesId} has been recorded successfully`
      });
      
      // Reset form
      setSalesForm({
        salesId: getNextSalesId(),
        date: new Date(),
        customerId: 0,
        customerName: '',
        products: Array(5).fill({
          productId: 0,
          productName: '',
          salesPrice: 0,
          quantity: 0
        }),
        amountPaid: 0,
        totalAmount: 0
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="salesId">Sales ID</Label>
              <Input
                id="salesId"
                value={salesForm.salesId}
                disabled
                className="bg-gray-100"
              />
            </div>
            
            <div>
              <Label htmlFor="customer">Customer Name</Label>
              <Select
                value={salesForm.customerId ? String(salesForm.customerId) : ""}
                onValueChange={handleCustomerChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customerId} value={customer.customerId.toString()}>
                      {customer.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date">Sales Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(salesForm.date, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={salesForm.date}
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
                  {salesForm.products.map((product, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={product.productId ? String(product.productId) : ""}
                          onValueChange={(value) => handleProductChange(index, value)}
                          disabled={!salesForm.customerId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map((p) => (
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
                          value={product.salesPrice || ""}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          placeholder="Price"
                          disabled={!product.productId}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          value={product.quantity || ""}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          placeholder="Qty"
                          disabled={!product.productId}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{(product.salesPrice * product.quantity).toLocaleString()}
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

            <div className="mt-4 space-y-4">
              <Button variant="outline" onClick={addRow}>
                <Plus className="h-4 w-4 mr-2" /> Add Row
              </Button>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="amountPaid">Amount Paid</Label>
                  <Input
                    id="amountPaid"
                    type="number"
                    value={salesForm.amountPaid || ""}
                    onChange={(e) => handleAmountPaidChange(e.target.value)}
                    placeholder="Enter amount paid"
                    disabled={!salesForm.customerId}
                  />
                </div>
                
                <div className="flex flex-col justify-end">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total:</span>
                      <span className="font-medium">₹{salesForm.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Paid:</span>
                      <span className="font-medium">₹{salesForm.amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Balance:</span>
                      <span className="font-medium">
                        ₹{(salesForm.totalAmount - salesForm.amountPaid).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={handleSubmit}>
                  <Save className="h-4 w-4 mr-2" /> Complete Sale
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Third tab: Modify Sales component
const ModifySale = () => {
  const { toast } = useToast();
  const [searchId, setSearchId] = useState('');
  const [salesForm, setSalesForm] = useState<SalesForm | null>(null);
  
  const handleSearch = () => {
    const sale = getSaleById(searchId);
    
    if (sale) {
      setSalesForm({
        salesId: sale.salesId,
        date: new Date(sale.date),
        customerId: sale.customerId,
        customerName: sale.customerName,
        products: sale.products,
        amountPaid: sale.amountPaid,
        totalAmount: sale.totalAmount
      });
    } else {
      toast({
        title: "Not Found",
        description: `Sales ID: ${searchId} not found`,
        variant: "destructive"
      });
      setSalesForm(null);
    }
  };

  const handleProductChange = (index: number, field: keyof SalesProduct, value: any) => {
    if (!salesForm) return;
    
    const updatedProducts = [...salesForm.products];
    
    if (field === "productId") {
      const productId_num = parseInt(value);
      const product = products.find(p => p.productId === productId_num);
      
      if (product) {
        const price = getCustomerProductPrice(salesForm.customerId, productId_num);
        
        updatedProducts[index] = {
          productId: productId_num,
          productName: product.productName,
          salesPrice: price,
          quantity: updatedProducts[index].quantity
        };
      }
    } else {
      updatedProducts[index] = {
        ...updatedProducts[index],
        [field]: field === 'quantity' ? parseInt(value) : parseFloat(value)
      };
    }
    
    setSalesForm({
      ...salesForm,
      products: updatedProducts,
    });
    
    calculateTotal(updatedProducts);
  };

  const calculateTotal = (updatedProducts: SalesProduct[]) => {
    if (!salesForm) return;
    
    const total = updatedProducts.reduce(
      (sum, product) => sum + (product.salesPrice * product.quantity),
      0
    );
    
    setSalesForm({
      ...salesForm,
      totalAmount: total
    });
  };

  const handleAmountPaidChange = (amount: string) => {
    if (!salesForm) return;
    
    const amountValue = parseFloat(amount);
    
    setSalesForm({
      ...salesForm,
      amountPaid: isNaN(amountValue) ? 0 : amountValue
    });
  };

  const addRow = () => {
    if (!salesForm) return;
    
    setSalesForm({
      ...salesForm,
      products: [
        ...salesForm.products,
        { productId: 0, productName: '', salesPrice: 0, quantity: 0 }
      ]
    });
  };

  const removeRow = (index: number) => {
    if (!salesForm) return;
    
    const updatedProducts = [...salesForm.products];
    updatedProducts.splice(index, 1);
    
    setSalesForm({
      ...salesForm,
      products: updatedProducts,
    });
    
    calculateTotal(updatedProducts);
  };

  const handleSubmit = () => {
    if (!salesForm) return;
    
    const validProducts = salesForm.products.filter(
      p => p.productId !== 0 && p.quantity > 0
    );
    
    if (validProducts.length === 0 && salesForm.amountPaid === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product or enter amount paid",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Sale Updated",
      description: `Sales ID: ${salesForm.salesId} has been updated successfully`,
    });
    
    setSalesForm(null);
    setSearchId('');
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter Sales ID..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" /> Find
            </Button>
          </div>
        </div>
        
        {salesForm && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="salesId">Sales ID</Label>
                <Input
                  id="salesId"
                  value={salesForm.salesId}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="customer">Customer Name</Label>
                <Input
                  id="customer"
                  value={salesForm.customerName}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              
              <div>
                <Label htmlFor="date">Sales Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {format(salesForm.date, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={salesForm.date}
                      onSelect={(date) => {
                        if (date) {
                          setSalesForm({...salesForm, date});
                        }
                      }}
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
                    {salesForm.products.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Select
                            value={product.productId ? String(product.productId) : ""}
                            onValueChange={(value) => handleProductChange(index, "productId", value)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select product" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.map((p) => (
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
                            value={product.salesPrice || ""}
                            onChange={(e) => handleProductChange(index, "salesPrice", e.target.value)}
                            placeholder="Price"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Input
                            type="number"
                            value={product.quantity || ""}
                            onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
                            placeholder="Qty"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{(product.salesPrice * product.quantity).toLocaleString()}
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
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="amountPaid">Amount Paid</Label>
                    <Input
                      id="amountPaid"
                      type="number"
                      value={salesForm.amountPaid || ""}
                      onChange={(e) => handleAmountPaidChange(e.target.value)}
                      placeholder="Enter amount paid"
                      className="w-[200px]"
                    />
                  </div>
                  
                  <div className="text-right">
                    <div className="text-gray-500 text-sm mb-1">
                      Total Amount: <span className="font-bold">₹
                        {salesForm.totalAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" onClick={() => setSalesForm(null)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        <Save className="h-4 w-4 mr-2" /> Update Sale
                      </Button>
                    </div>
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

// Main Sales component with tabs
const Sales = () => {
  const tabs = [
    {
      value: 'details',
      label: 'Sales Details',
      content: <SalesDetails />,
    },
    {
      value: 'add',
      label: 'Add New',
      content: <AddNewSale />,
    },
    {
      value: 'modify',
      label: 'Modify',
      content: <ModifySale />,
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Sales Management" 
        subtitle="Process sales and manage customer transactions"
      />
      
      <TabsContainer tabs={tabs} />
    </div>
  );
};

export default Sales;
