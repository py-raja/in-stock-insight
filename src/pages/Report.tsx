
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Download, BarChart3, Users, ShoppingCart, FileText, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { 
  customers, 
  products, 
  sales,
  purchases,
  getSalesPurchaseData
} from '@/services/mockData';

const SalesReport = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCustomer, setSelectedCustomer] = useState<string>('all');
  
  const chartData = getSalesPurchaseData();
  
  // Filter sales based on date range and customer
  const filteredSales = sales.filter(sale => {
    const saleDate = new Date(sale.date);
    const isInDateRange = saleDate >= startDate && saleDate <= endDate;
    
    if (selectedCustomer === 'all') {
      return isInDateRange;
    } else {
      return isInDateRange && sale.customerId === parseInt(selectedCustomer);
    }
  });
  
  // Group sales by customer
  const salesByCustomer = filteredSales.reduce<any[]>((acc, sale) => {
    const existingCustomer = acc.find(s => s.customerId === sale.customerId);
    
    if (existingCustomer) {
      existingCustomer.totalAmount += sale.totalAmount;
      existingCustomer.amountPaid += sale.amountPaid;
      existingCustomer.salesCount += 1;
    } else {
      acc.push({
        customerId: sale.customerId,
        customerName: sale.customerName,
        totalAmount: sale.totalAmount,
        amountPaid: sale.amountPaid,
        salesCount: 1,
        balance: sale.totalAmount - sale.amountPaid
      });
    }
    
    return acc;
  }, []);
  
  // Group sales by product
  const salesByProduct: {
    productId: number;
    productName: string;
    quantity: number;
    totalAmount: number;
  }[] = [];
  
  filteredSales.forEach(sale => {
    sale.products.forEach(product => {
      const existingProduct = salesByProduct.find(p => p.productId === product.productId);
      
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
        existingProduct.totalAmount += product.salesPrice * product.quantity;
      } else {
        salesByProduct.push({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          totalAmount: product.salesPrice * product.quantity
        });
      }
    });
  });
  
  // Calculate totals
  const totalSales = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaid = filteredSales.reduce((sum, sale) => sum + sale.amountPaid, 0);
  const totalBalance = totalSales - totalPaid;
  
  const customerColumns = [
    { header: 'Customer', accessorKey: 'customerName' },
    { 
      header: 'Sales Count', 
      accessorKey: 'salesCount'
    },
    { 
      header: 'Total Sales', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    },
    { 
      header: 'Amount Received', 
      accessorKey: (row: any) => `₹${row.amountPaid.toLocaleString()}`
    },
    { 
      header: 'Balance', 
      accessorKey: (row: any) => `₹${(row.totalAmount - row.amountPaid).toLocaleString()}`
    }
  ];
  
  const productColumns = [
    { header: 'Product', accessorKey: 'productName' },
    { header: 'Quantity Sold', accessorKey: 'quantity' },
    { 
      header: 'Total Amount', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    }
  ];
  
  const transactionColumns = [
    { header: 'Invoice #', accessorKey: 'salesId' },
    { header: 'Date', accessorKey: 'date' },
    { header: 'Customer', accessorKey: 'customerName' },
    { 
      header: 'Products', 
      accessorKey: (row: any) => `${row.products.length} items`
    },
    { 
      header: 'Amount', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    },
    { 
      header: 'Paid', 
      accessorKey: (row: any) => `₹${row.amountPaid.toLocaleString()}`
    },
    { 
      header: 'Balance', 
      accessorKey: (row: any) => `₹${(row.totalAmount - row.amountPaid).toLocaleString()}`
    }
  ];
  
  const downloadReport = () => {
    // In a real app, this would generate a CSV file
    toast({
      title: "Report Downloaded",
      description: "Sales report has been downloaded as CSV"
    });
  };

  return (
    <div>
      <PageHeader 
        title="Sales Report" 
        subtitle="Analyze sales data by customer, product, and date"
        actions={
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" /> Export to CSV
          </Button>
        }
      />
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">Customer</label>
              <Select
                value={selectedCustomer}
                onValueChange={setSelectedCustomer}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.customerId} value={customer.customerId.toString()}>
                      {customer.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Sales</CardTitle>
            <CardDescription className="text-2xl font-bold text-black">
              ₹{totalSales.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Received</CardTitle>
            <CardDescription className="text-2xl font-bold text-black">
              ₹{totalPaid.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Balance</CardTitle>
            <CardDescription className="text-2xl font-bold text-black">
              ₹{totalBalance.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sales Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" name="Sales" />
              <Bar dataKey="profit" fill="#10b981" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="customers">
        <TabsList className="mb-4">
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" /> By Customers
          </TabsTrigger>
          <TabsTrigger value="products">
            <ShoppingCart className="h-4 w-4 mr-2" /> By Products
          </TabsTrigger>
          <TabsTrigger value="transactions">
            <FileText className="h-4 w-4 mr-2" /> All Transactions
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={salesByCustomer}
                columns={customerColumns}
                emptyMessage="No customer sales found for the selected period"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={salesByProduct}
                columns={productColumns}
                emptyMessage="No product sales found for the selected period"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredSales}
                columns={transactionColumns}
                emptyMessage="No transactions found for the selected period"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const PurchaseReport = () => {
  const { toast } = useToast();
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  );
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  
  // Get unique company names
  const companyNames = [...new Set(purchases.map(p => p.companyName))];
  
  // Filter purchases based on date range and company
  const filteredPurchases = purchases.filter(purchase => {
    const purchaseDate = new Date(purchase.purchaseDate);
    const isInDateRange = purchaseDate >= startDate && purchaseDate <= endDate;
    
    if (selectedCompany === 'all') {
      return isInDateRange;
    } else {
      return isInDateRange && purchase.companyName === selectedCompany;
    }
  });
  
  // Calculate totals
  const totalPurchaseAmount = filteredPurchases.reduce((sum, purchase) => {
    return sum + purchase.products.reduce(
      (subSum, product) => subSum + (product.purchasePrice * product.quantity), 
      0
    );
  }, 0);
  
  // Group purchases by company
  const purchasesByCompany = filteredPurchases.reduce<any[]>((acc, purchase) => {
    const purchaseAmount = purchase.products.reduce(
      (sum, product) => sum + (product.purchasePrice * product.quantity), 
      0
    );
    
    const existingCompany = acc.find(p => p.companyName === purchase.companyName);
    
    if (existingCompany) {
      existingCompany.totalAmount += purchaseAmount;
      existingCompany.purchaseCount += 1;
    } else {
      acc.push({
        companyName: purchase.companyName,
        totalAmount: purchaseAmount,
        purchaseCount: 1
      });
    }
    
    return acc;
  }, []);
  
  // Group purchases by product
  const purchasesByProduct: {
    productId: number;
    productName: string;
    quantity: number;
    totalAmount: number;
  }[] = [];
  
  filteredPurchases.forEach(purchase => {
    purchase.products.forEach(product => {
      const existingProduct = purchasesByProduct.find(p => p.productId === product.productId);
      
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
        existingProduct.totalAmount += product.purchasePrice * product.quantity;
      } else {
        purchasesByProduct.push({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          totalAmount: product.purchasePrice * product.quantity
        });
      }
    });
  });
  
  const companyColumns = [
    { header: 'Company', accessorKey: 'companyName' },
    { 
      header: 'Purchase Count', 
      accessorKey: 'purchaseCount'
    },
    { 
      header: 'Total Amount', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    }
  ];
  
  const productColumns = [
    { header: 'Product', accessorKey: 'productName' },
    { header: 'Quantity Purchased', accessorKey: 'quantity' },
    { 
      header: 'Total Amount', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    }
  ];
  
  const purchaseColumns = [
    { header: 'Purchase ID', accessorKey: 'purchaseId' },
    { header: 'Date', accessorKey: 'purchaseDate' },
    { header: 'Company', accessorKey: 'companyName' },
    { 
      header: 'Products', 
      accessorKey: (row: any) => `${row.products.length} items`
    },
    { 
      header: 'Total Amount', 
      accessorKey: (row: any) => {
        const total = row.products.reduce(
          (sum: number, product: any) => sum + (product.purchasePrice * product.quantity), 
          0
        );
        return `₹${total.toLocaleString()}`;
      }
    }
  ];
  
  const downloadReport = () => {
    // In a real app, this would generate a CSV file
    toast({
      title: "Report Downloaded",
      description: "Purchase report has been downloaded as CSV"
    });
  };

  return (
    <div>
      <PageHeader 
        title="Purchase Report" 
        subtitle="Analyze purchase data by company, product, and date"
        actions={
          <Button onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" /> Export to CSV
          </Button>
        }
      />
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(startDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {format(endDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="text-sm font-medium">Company</label>
              <Select
                value={selectedCompany}
                onValueChange={setSelectedCompany}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companyNames.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Total Purchases</CardTitle>
            <CardDescription className="text-2xl font-bold text-black">
              ₹{totalPurchaseAmount.toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Purchase Orders</CardTitle>
            <CardDescription className="text-2xl font-bold text-black">
              {filteredPurchases.length}
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">Companies</CardTitle>
            <CardDescription className="text-2xl font-bold text-black">
              {purchasesByCompany.length}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
      
      <Tabs defaultValue="companies">
        <TabsList className="mb-4">
          <TabsTrigger value="companies">
            <Users className="h-4 w-4 mr-2" /> By Companies
          </TabsTrigger>
          <TabsTrigger value="products">
            <ShoppingCart className="h-4 w-4 mr-2" /> By Products
          </TabsTrigger>
          <TabsTrigger value="purchases">
            <FileText className="h-4 w-4 mr-2" /> All Purchases
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>Purchases by Company</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={purchasesByCompany}
                columns={companyColumns}
                emptyMessage="No company purchases found for the selected period"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Purchases by Product</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={purchasesByProduct}
                columns={productColumns}
                emptyMessage="No product purchases found for the selected period"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>All Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={filteredPurchases}
                columns={purchaseColumns}
                emptyMessage="No purchases found for the selected period"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const CustomerReport = () => {
  const { toast } = useToast();
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  
  // Get customer details
  const customer = selectedCustomer ? customers.find(c => c.customerId.toString() === selectedCustomer) : null;
  
  // Get customer sales
  const customerSales = selectedCustomer ? 
    sales.filter(sale => sale.customerId.toString() === selectedCustomer) : [];
  
  // Calculate totals
  const totalSalesAmount = customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaidAmount = customerSales.reduce((sum, sale) => sum + sale.amountPaid, 0);
  const balanceAmount = totalSalesAmount - totalPaidAmount;
  
  // Calculate products purchased
  const productsPurchased: {
    productId: number;
    productName: string;
    quantity: number;
    totalAmount: number;
  }[] = [];
  
  customerSales.forEach(sale => {
    sale.products.forEach(product => {
      const existingProduct = productsPurchased.find(p => p.productId === product.productId);
      
      if (existingProduct) {
        existingProduct.quantity += product.quantity;
        existingProduct.totalAmount += product.salesPrice * product.quantity;
      } else {
        productsPurchased.push({
          productId: product.productId,
          productName: product.productName,
          quantity: product.quantity,
          totalAmount: product.salesPrice * product.quantity
        });
      }
    });
  });
  
  const transactionColumns = [
    { header: 'Invoice #', accessorKey: 'salesId' },
    { header: 'Date', accessorKey: 'date' },
    { 
      header: 'Products', 
      accessorKey: (row: any) => `${row.products.length} items`
    },
    { 
      header: 'Amount', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    },
    { 
      header: 'Paid', 
      accessorKey: (row: any) => `₹${row.amountPaid.toLocaleString()}`
    },
    { 
      header: 'Balance', 
      accessorKey: (row: any) => `₹${(row.totalAmount - row.amountPaid).toLocaleString()}`
    }
  ];
  
  const productColumns = [
    { header: 'Product', accessorKey: 'productName' },
    { header: 'Quantity Purchased', accessorKey: 'quantity' },
    { 
      header: 'Total Amount', 
      accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}`
    }
  ];
  
  const downloadReport = () => {
    if (!customer) return;
    
    // In a real app, this would generate a CSV file
    toast({
      title: "Report Downloaded",
      description: `Customer report for ${customer.customerName} has been downloaded as CSV`
    });
  };

  return (
    <div>
      <PageHeader 
        title="Customer Report" 
        subtitle="View detailed reports for individual customers"
        actions={
          customer && (
            <Button onClick={downloadReport}>
              <Download className="h-4 w-4 mr-2" /> Export to CSV
            </Button>
          )
        }
      />
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div>
            <label className="text-sm font-medium">Select Customer</label>
            <Select
              value={selectedCustomer}
              onValueChange={setSelectedCustomer}
            >
              <SelectTrigger className="mt-1">
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
        </CardContent>
      </Card>
      
      {customer ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Name:</dt>
                    <dd className="font-medium">{customer.customerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Address:</dt>
                    <dd className="font-medium">{customer.customerAddress}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Mobile:</dt>
                    <dd className="font-medium">{customer.customerMobile}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Current Balance:</dt>
                    <dd className="font-medium">₹{customer.amountBalance.toLocaleString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Sales:</dt>
                    <dd className="font-medium">₹{totalSalesAmount.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Paid:</dt>
                    <dd className="font-medium">₹{totalPaidAmount.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Outstanding Balance:</dt>
                    <dd className="font-medium">₹{balanceAmount.toLocaleString()}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Total Transactions:</dt>
                    <dd className="font-medium">{customerSales.length}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="transactions">
            <TabsList className="mb-4">
              <TabsTrigger value="transactions">
                <FileText className="h-4 w-4 mr-2" /> Transactions
              </TabsTrigger>
              <TabsTrigger value="products">
                <ShoppingCart className="h-4 w-4 mr-2" /> Products Purchased
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transactions">
              <Card>
                <CardHeader>
                  <CardTitle>Transaction History</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={customerSales}
                    columns={transactionColumns}
                    emptyMessage="No transactions found for this customer"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="products">
              <Card>
                <CardHeader>
                  <CardTitle>Products Purchased</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={productsPurchased}
                    columns={productColumns}
                    emptyMessage="No products purchased by this customer"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] text-gray-500">
            <User className="h-12 w-12 mb-4 text-gray-300" />
            <p>Select a customer to view their report</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Report = () => {
  const reportTypes = [
    { value: 'sales', label: 'Sales Report', icon: BarChart3 },
    { value: 'purchase', label: 'Purchase Report', icon: ShoppingCart },
    { value: 'customer', label: 'Customer Report', icon: User },
  ];
  
  return (
    <div>
      <PageHeader 
        title="Reports" 
        subtitle="Generate analytical reports on sales, inventory, and financials"
      />
      
      <Tabs defaultValue="sales">
        <TabsList className="mb-6">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            return (
              <TabsTrigger key={type.value} value={type.value}>
                <Icon className="h-4 w-4 mr-2" /> {type.label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        
        <TabsContent value="sales">
          <SalesReport />
        </TabsContent>
        
        <TabsContent value="purchase">
          <PurchaseReport />
        </TabsContent>
        
        <TabsContent value="customer">
          <CustomerReport />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Report;
