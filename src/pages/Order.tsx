import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash, Save, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PageHeader from '@/components/common/PageHeader';
import { 
  customers, 
  products, 
  orders,
  Order as OrderType,
  getCustomerProductPrice,
  getNextOrderId,
  updateInventoryFromOrder,
  updateCustomerBalance
} from '@/services/mockData';

interface CalendarDayOrders {
  [date: string]: OrderType[];
}

interface OrderProduct {
  productId: number;
  productName: string;
  salesPrice: number;
  quantity: number;
}

const OrderCalendar = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [advanceAmountDialogOpen, setAdvanceAmountDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [calendarOrders, setCalendarOrders] = useState<CalendarDayOrders>(() => {
    // Group orders by date
    const grouped: CalendarDayOrders = {};
    orders.forEach(order => {
      const date = order.orderDate;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(order);
    });
    return grouped;
  });
  
  // Form state for new order
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    orderDate: format(selectedDate, 'yyyy-MM-dd'),
    products: Array(3).fill({ productId: 0, productName: '', salesPrice: 0, quantity: 0 }),
    remarks: '',
    status: 'pending',
    advanceAmount: 0
  });
  
  // Form state for modifying an order
  const [modifyForm, setModifyForm] = useState<OrderType | null>(null);

  const handleOrderClick = (order: OrderType) => {
    setSelectedOrder(order);
  };

  const handleNewOrder = () => {
    setOrderForm({
      customerId: '',
      orderDate: format(selectedDate, 'yyyy-MM-dd'),
      products: Array(3).fill({ productId: 0, productName: '', salesPrice: 0, quantity: 0 }),
      remarks: '',
      status: 'pending',
      advanceAmount: 0
    });
    setOrderDialogOpen(true);
  };
  
  const handleCustomerChange = (customerId: string) => {
    setOrderForm({
      ...orderForm,
      customerId,
      products: Array(3).fill({ productId: 0, productName: '', salesPrice: 0, quantity: 0 }),
    });
  };
  
  const handleProductChange = (index: number, productId: string) => {
    const productId_num = parseInt(productId);
    const product = products.find(p => p.productId === productId_num);
    
    if (product && orderForm.customerId) {
      const price = getCustomerProductPrice(parseInt(orderForm.customerId), productId_num);
      
      const updatedProducts = [...orderForm.products];
      updatedProducts[index] = {
        productId: productId_num,
        productName: product.productName,
        salesPrice: price,
        quantity: 0
      };
      
      setOrderForm({
        ...orderForm,
        products: updatedProducts,
      });
    }
  };
  
  const handleQuantityChange = (index: number, quantity: string) => {
    const qty = parseInt(quantity);
    
    const updatedProducts = [...orderForm.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: isNaN(qty) ? 0 : qty
    };
    
    setOrderForm({
      ...orderForm,
      products: updatedProducts,
    });
  };
  
  const handlePriceChange = (index: number, price: string) => {
    const priceValue = parseFloat(price);
    
    const updatedProducts = [...orderForm.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      salesPrice: isNaN(priceValue) ? 0 : priceValue
    };
    
    setOrderForm({
      ...orderForm,
      products: updatedProducts,
    });
  };
  
  const handleOrderDateChange = (date: Date) => {
    setOrderForm({
      ...orderForm,
      orderDate: format(date, 'yyyy-MM-dd')
    });
  };
  
  const addProductRow = () => {
    setOrderForm({
      ...orderForm,
      products: [
        ...orderForm.products,
        { productId: 0, productName: '', salesPrice: 0, quantity: 0 }
      ]
    });
  };
  
  const removeProductRow = (index: number) => {
    const updatedProducts = [...orderForm.products];
    updatedProducts.splice(index, 1);
    
    setOrderForm({
      ...orderForm,
      products: updatedProducts
    });
  };
  
  const handleModifyProductChange = (index: number, productId: string) => {
    if (!modifyForm) return;
    
    const productId_num = parseInt(productId);
    const product = products.find(p => p.productId === productId_num);
    
    if (product) {
      const price = getCustomerProductPrice(modifyForm.customerId, productId_num);
      
      const updatedProducts = [...modifyForm.products];
      updatedProducts[index] = {
        productId: productId_num,
        productName: product.productName,
        salesPrice: price,
        quantity: 0
      };
      
      setModifyForm({
        ...modifyForm,
        products: updatedProducts,
      });
    }
  };
  
  const handleModifyQuantityChange = (index: number, quantity: string) => {
    if (!modifyForm) return;
    
    const qty = parseInt(quantity);
    
    const updatedProducts = [...modifyForm.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      quantity: isNaN(qty) ? 0 : qty
    };
    
    setModifyForm({
      ...modifyForm,
      products: updatedProducts,
    });
  };
  
  const handleModifyPriceChange = (index: number, price: string) => {
    if (!modifyForm) return;
    
    const priceValue = parseFloat(price);
    
    const updatedProducts = [...modifyForm.products];
    updatedProducts[index] = {
      ...updatedProducts[index],
      salesPrice: isNaN(priceValue) ? 0 : priceValue
    };
    
    setModifyForm({
      ...modifyForm,
      products: updatedProducts,
    });
  };
  
  const addModifyProductRow = () => {
    if (!modifyForm) return;
    
    setModifyForm({
      ...modifyForm,
      products: [
        ...modifyForm.products,
        { productId: 0, productName: '', salesPrice: 0, quantity: 0 }
      ]
    });
  };
  
  const removeModifyProductRow = (index: number) => {
    if (!modifyForm) return;
    
    const updatedProducts = [...modifyForm.products];
    updatedProducts.splice(index, 1);
    
    setModifyForm({
      ...modifyForm,
      products: updatedProducts
    });
  };

  const handleSubmitOrder = () => {
    // Validate
    if (!orderForm.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty products
    const validProducts = orderForm.products.filter(
      p => p.productId !== 0 && p.quantity > 0
    );
    
    if (validProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive"
      });
      return;
    }
    
    // Get customer details
    const customer = customers.find(c => c.customerId.toString() === orderForm.customerId);
    if (!customer) return;
    
    // Generate Order ID
    const nextId = getNextOrderId('O');
    
    // Create new order
    const formattedDate = orderForm.orderDate;
    const newOrder: OrderType = {
      orderId: nextId,
      orderDate: formattedDate,
      customerId: parseInt(orderForm.customerId),
      customerName: customer.customerName,
      products: validProducts,
      remarks: orderForm.remarks,
      status: 'pending',
      advanceAmount: 0
    };
    
    // Add to calendar orders
    setCalendarOrders(prev => {
      const updated = { ...prev };
      if (!updated[formattedDate]) {
        updated[formattedDate] = [];
      }
      updated[formattedDate] = [...updated[formattedDate], newOrder];
      return updated;
    });
    
    setOrderForm({
      customerId: '',
      orderDate: format(selectedDate, 'yyyy-MM-dd'),
      products: Array(3).fill({ productId: 0, productName: '', salesPrice: 0, quantity: 0 }),
      remarks: '',
      status: 'pending',
      advanceAmount: 0
    });
    
    setOrderDialogOpen(false);
    setSelectedOrder(newOrder);
    
    // Update inventory for ordered quantities
    updateInventoryFromOrder(newOrder, 'order');
    
    // Show advance amount dialog
    setAdvanceAmountDialogOpen(true);
    
    toast({
      title: "Order Created",
      description: `Order #${newOrder.orderId} has been created for ${customer.customerName}`
    });
  };
  
  const handleAdvanceAmountSubmit = () => {
    if (!selectedOrder) return;
    
    // Update the order with advance amount
    const updatedOrder = { ...selectedOrder, advanceAmount };
    
    // Update calendar orders
    setCalendarOrders(prev => {
      const updated = { ...prev };
      const date = selectedOrder.orderDate;
      
      if (updated[date]) {
        updated[date] = updated[date].map(order => 
          order.orderId === selectedOrder.orderId ? updatedOrder : order
        );
      }
      
      return updated;
    });
    
    setSelectedOrder(updatedOrder);
    setAdvanceAmountDialogOpen(false);
    setAdvanceAmount(0);
    
    // Update customer balance
    if (advanceAmount > 0) {
      updateCustomerBalance(updatedOrder.customerId, advanceAmount);
    }
    
    toast({
      title: "Advance Payment Applied",
      description: `₹${advanceAmount.toLocaleString()} advance payment recorded for Order #${updatedOrder.orderId}`
    });
  };
  
  const handleModifyOrder = () => {
    if (!selectedOrder) return;
    
    setModifyForm({ ...selectedOrder });
    setModifyDialogOpen(true);
  };
  
  const handleSaveModifiedOrder = () => {
    if (!modifyForm || !selectedOrder) return;
    
    // Validate
    const validProducts = modifyForm.products.filter(
      p => p.productId !== 0 && p.quantity > 0
    );
    
    if (validProducts.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one product",
        variant: "destructive"
      });
      return;
    }
    
    // Update inventory - first remove old quantities, then add new ones
    updateInventoryFromOrder(selectedOrder, 'cancel');
    
    const updatedOrder = {
      ...modifyForm,
      products: validProducts
    };
    
    // Update inventory with new quantities
    updateInventoryFromOrder(updatedOrder, 'order');
    
    // Update calendar orders
    setCalendarOrders(prev => {
      const updated = { ...prev };
      const date = selectedOrder.orderDate;
      
      if (updated[date]) {
        updated[date] = updated[date].map(order => 
          order.orderId === selectedOrder.orderId ? updatedOrder : order
        );
      }
      
      return updated;
    });
    
    setSelectedOrder(updatedOrder);
    setModifyDialogOpen(false);
    setModifyForm(null);
    
    toast({
      title: "Order Modified",
      description: `Order #${updatedOrder.orderId} has been updated successfully`
    });
  };
  
  const updateOrderStatus = (status: 'pending' | 'processing' | 'completed' | 'cancelled') => {
    if (!selectedOrder) return;
    
    // For cancel, update inventory by removing ordered quantities
    if (status === 'cancelled') {
      updateInventoryFromOrder(selectedOrder, 'cancel');
    }
    
    // For complete, create a sales ID and update inventory available quantities
    if (status === 'completed') {
    // Generate Sales ID using the next available ID
    const salesId = getNextOrderId('S');
    
    // Update inventory - move from ordered to available
    updateInventoryFromOrder(selectedOrder, 'complete');
    
    // Update the order with completed status and salesId
    const updatedOrder = { 
      ...selectedOrder, 
      status, 
      salesId 
    };
    
    // Update calendar orders
    setCalendarOrders(prev => {
      const updated = { ...prev };
      const date = selectedOrder.orderDate;
      
      if (updated[date]) {
        updated[date] = updated[date].map(order => 
          order.orderId === selectedOrder.orderId ? updatedOrder : order
        );
      }
      
      return updated;
    });
    
    setSelectedOrder(updatedOrder);
    
    toast({
      title: "Order Completed",
      description: `Order #${selectedOrder.orderId} completed and Sales ID ${salesId} generated`
    });
    
    return;
  }
    
    // Update order status
    const updatedOrder = { ...selectedOrder, status };
    
    // Update calendar orders
    setCalendarOrders(prev => {
      const updated = { ...prev };
      const date = selectedOrder.orderDate;
      
      if (updated[date]) {
        updated[date] = updated[date].map(order => 
          order.orderId === selectedOrder.orderId ? updatedOrder : order
        );
      }
      
      return updated;
    });
    
    setSelectedOrder(updatedOrder);
    
    toast({
      title: "Order Updated",
      description: `Order #${selectedOrder.orderId} status changed to ${status}`
    });
  };
  
  // Get all dates that have orders for the calendar
  const orderedDates = Object.keys(calendarOrders);
  
  // Create a function to render day contents in the calendar
  const renderDayContent = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayOrders = calendarOrders[dateString] || [];
    
    // Count pending orders
    const pendingOrders = dayOrders.filter(order => order.status === 'pending').length;
    
    if (dayOrders.length > 0) {
      return (
        <div className="flex flex-col items-center">
          <div>{format(day, 'd')}</div>
          {pendingOrders > 0 && (
            <Badge variant="secondary" className="mt-1">
              {pendingOrders}
            </Badge>
          )}
        </div>
      );
    }
    
    return <div>{format(day, 'd')}</div>;
  };
  
  // Get orders for the selected date
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateOrders = calendarOrders[selectedDateString] || [];
  
  // Function to get color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <PageHeader 
        title="Order Management" 
        subtitle={`Orders for ${format(selectedDate, 'MMMM d, yyyy')}`}
        actions={
          <Button onClick={handleNewOrder}>
            <Plus className="h-4 w-4 mr-2" /> Add Order
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle>Order Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border w-full pointer-events-auto"
                modifiersStyles={{
                  selected: { fontWeight: "bold" }
                }}
                components={{
                  DayContent: ({ date }) => renderDayContent(date)
                }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <CardTitle>
              Orders for {format(selectedDate, 'MMMM d, yyyy')}
              {selectedDateOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedDateOrders.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders scheduled for this date
              </div>
            ) : (
              <div className="space-y-4">
                {selectedDateOrders.map((order) => (
                  <Card 
                    key={order.orderId}
                    className={`cursor-pointer transition-all ${selectedOrder?.orderId === order.orderId ? 'border-primary' : ''}`}
                    onClick={() => handleOrderClick(order)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.customerName}</span>
                          <span className="text-sm text-gray-500">Order #{order.orderId}</span>
                          {order.salesId && (
                            <span className="text-xs text-gray-500">Sales ID: {order.salesId}</span>
                          )}
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-gray-500">
                          {order.products.length} products
                        </span>
                        {order.advanceAmount > 0 && (
                          <span className="text-sm text-green-600">
                            Advance: ₹{order.advanceAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {selectedOrder && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Order #{selectedOrder.orderId} Details</span>
              <Badge className={getStatusColor(selectedOrder.status)}>
                {selectedOrder.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer</h3>
                <p>{selectedOrder.customerName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                <p>{format(new Date(selectedOrder.orderDate), 'MMMM d, yyyy')}</p>
              </div>
              {selectedOrder.advanceAmount > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Advance Payment</h3>
                  <p className="text-green-600">₹{selectedOrder.advanceAmount.toLocaleString()}</p>
                </div>
              )}
              {selectedOrder.salesId && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Sales ID</h3>
                  <p>{selectedOrder.salesId}</p>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Products</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.products.map((product, index) => (
                      <tr key={index}>
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
                          ₹{(product.salesPrice * product.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-right font-medium">Total Amount:</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        ₹{selectedOrder.products.reduce((sum, product) => sum + (product.salesPrice * product.quantity), 0).toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {selectedOrder.remarks && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Remarks</h3>
                <p className="text-sm p-3 bg-gray-50 rounded-md">{selectedOrder.remarks}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t p-4">
            <div>
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                <Button variant="destructive" onClick={() => updateOrderStatus('cancelled')}>
                  Cancel Order
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              {selectedOrder.status === 'pending' && (
                <>
                  <Button variant="outline" onClick={handleModifyOrder}>
                    Modify Order
                  </Button>
                  <Button onClick={() => updateOrderStatus('completed')}>
                    <Check className="h-4 w-4 mr-2" /> Complete Order
                  </Button>
                </>
              )}
              
              {selectedOrder.status === 'processing' && (
                <Button onClick={() => updateOrderStatus('completed')}>
                  <Check className="h-4 w-4 mr-2" /> Complete Order
                </Button>
              )}
              
              {(selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled') && (
                <Button variant="outline" onClick={() => updateOrderStatus('pending')}>
                  Reopen Order
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}
      
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogDescription>
          Add a new order for delivery.
        </DialogDescription>
      </DialogHeader>
      
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customer">Customer</Label>
            <Select
              value={orderForm.customerId}
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
            <Label htmlFor="orderDate">Order Date</Label>
            <div className="flex w-full items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {orderForm.orderDate ? format(new Date(orderForm.orderDate), 'MMMM d, yyyy') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={orderForm.orderDate ? new Date(orderForm.orderDate) : undefined}
                    onSelect={(date) => date && handleOrderDateChange(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            <Label>Products</Label>
            <Button variant="outline" size="sm" onClick={addProductRow}>
              <Plus className="h-4 w-4 mr-2" /> Add Product
            </Button>
          </div>
          
          <div className="max-h-[400px] overflow-y-auto border rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderForm.products.map((product, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Select
                        value={product.productId ? String(product.productId) : ""}
                        onValueChange={(value) => handleProductChange(index, value)}
                        disabled={!orderForm.customerId}
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
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Input
                        type="number"
                        value={product.salesPrice || ""}
                        onChange={(e) => handlePriceChange(index, e.target.value)}
                        placeholder="Price"
                        disabled={!product.productId}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <Input
                        type="number"
                        value={product.quantity || ""}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        placeholder="Qty"
                        disabled={!product.productId}
                        className="w-24"
                      />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      ₹{(product.salesPrice * product.quantity).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProductRow(index)}
                        disabled={orderForm.products.length <= 3}
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
        </div>
        
        <div>
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            placeholder="Add any notes or special instructions for this order"
            value={orderForm.remarks}
            onChange={(e) => setOrderForm({...orderForm, remarks: e.target.value})}
            rows={3}
          />
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={() => setOrderDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmitOrder}>
          <Save className="h-4 w-4 mr-2" /> Create Order
        </Button>
      </DialogFooter>
    </DialogContent>
  
      </Dialog>
      
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Modify Order #{modifyForm?.orderId}</DialogTitle>
            <DialogDescription>
              Update order details for {modifyForm?.customerName}.
            </DialogDescription>
          </DialogHeader>
          
          {modifyForm && (
            <div className="grid gap-4 py-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Products</Label>
                  <Button variant="outline" size="sm" onClick={addModifyProductRow}>
                    <Plus className="h-4 w-4 mr-2" /> Add Product
                  </Button>
                </div>
                
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-5
