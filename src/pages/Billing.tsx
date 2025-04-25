
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Printer, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import PageHeader from '@/components/common/PageHeader';
import { customers, sales, getCustomerById } from '@/services/mockData';

const Billing = () => {
  const { toast } = useToast();
  const [customerId, setCustomerId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [billData, setBillData] = useState<any | null>(null);
  
  const handleCustomerChange = (value: string) => {
    setCustomerId(value);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const generateBill = () => {
    if (!customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }
    
    const customer = getCustomerById(parseInt(customerId));
    if (!customer) {
      toast({
        title: "Error",
        description: "Customer not found",
        variant: "destructive"
      });
      return;
    }
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const customerSales = sales.filter(
      sale => sale.customerId === parseInt(customerId) && sale.date === formattedDate
    );
    
    if (customerSales.length === 0) {
      toast({
        title: "No Sales Found",
        description: `No sales found for ${customer.customerName} on ${format(selectedDate, 'PP')}`,
        variant: "destructive"
      });
      return;
    }
    
    // Combine all products from sales
    const products = customerSales.flatMap(sale => sale.products.map(product => ({
      ...product,
      total: product.salesPrice * product.quantity
    })));
    
    // Calculate totals
    const totalAmount = customerSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const amountPaid = customerSales.reduce((sum, sale) => sum + sale.amountPaid, 0);
    const balance = totalAmount - amountPaid;
    
    setBillData({
      customer,
      date: formattedDate,
      products,
      totalAmount,
      amountPaid,
      balance,
      previousBalance: customer.amountBalance - balance,
      totalBalance: customer.amountBalance
    });
    
    toast({
      title: "Bill Generated",
      description: `Bill has been generated for ${customer.customerName}`
    });
  };

  const printBill = () => {
    // In a real application, this would trigger actual printing
    // For now, we'll just show a notification
    toast({
      title: "Printing Bill",
      description: "The bill has been sent to the printer"
    });
  };

  return (
    <div>
      <PageHeader 
        title="Billing" 
        subtitle="Generate invoices and process payments"
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <Select
                    value={customerId}
                    onValueChange={handleCustomerChange}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="date">Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(selectedDate, 'PPP')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button onClick={generateBill} className="w-full">
                  Generate Bill
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-2">
          {billData ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-2xl">Invoice</CardTitle>
                <Button variant="outline" size="sm" onClick={printBill}>
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Bill To:</p>
                      <p className="font-medium">{billData.customer.customerName}</p>
                      <p className="text-sm text-gray-500">{billData.customer.customerAddress}</p>
                      <p className="text-sm text-gray-500">Phone: {billData.customer.customerMobile}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Date:</p>
                      <p className="font-medium">{format(new Date(billData.date), 'PPP')}</p>
                    </div>
                  </div>
                  
                  <div className="border rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {billData.products.map((product: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.productName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{product.salesPrice.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              ₹{product.total.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="flex flex-col space-y-2 items-end">
                    <div className="grid grid-cols-2 gap-x-8 text-right">
                      <span className="text-gray-500">Today's Total:</span>
                      <span className="font-medium">₹{billData.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 text-right">
                      <span className="text-gray-500">Previous Balance:</span>
                      <span className="font-medium">₹{billData.previousBalance.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 text-right">
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="font-medium">₹{billData.amountPaid.toLocaleString()}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 text-right border-t pt-2 mt-2">
                      <span className="text-gray-700 font-medium">Total Balance:</span>
                      <span className="font-bold text-lg">₹{billData.totalBalance.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500 mt-8 pt-8 border-t">
                    <p>Thank you for your business!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px] text-gray-500">
                <Search className="h-12 w-12 mb-4 text-gray-300" />
                <p>Select a customer and date to generate bill</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Billing;
