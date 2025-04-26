import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import OrderCalendar from '@/components/order/OrderCalendar';
import OrderDetails from '@/components/order/OrderDetails';
import OrderForm from '@/components/order/OrderForm';
import { OrderType } from '@/types/order';
import { 
  customers, 
  products, 
  orders,
  getCustomerProductPrice,
  getNextOrderId,
  updateInventoryFromOrder,
  updateCustomerBalance
} from '@/services/mockData';

interface CalendarDayOrders {
  [date: string]: OrderType[];
}

const Order = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [advanceAmountDialogOpen, setAdvanceAmountDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [calendarOrders, setCalendarOrders] = useState<CalendarDayOrders>(() => {
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
  
  const [orderForm, setOrderForm] = useState({
    customerId: '',
    orderDate: format(selectedDate, 'yyyy-MM-dd'),
    products: Array(3).fill({ productId: 0, productName: '', salesPrice: 0, quantity: 0 }),
    remarks: '',
    status: 'pending',
    advanceAmount: 0
  });
  
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
    if (!orderForm.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive"
      });
      return;
    }
    
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
    
    const customer = customers.find(c => c.customerId.toString() === orderForm.customerId);
    if (!customer) return;
    
    const nextId = getNextOrderId('O');
    
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
    
    updateInventoryFromOrder(newOrder, 'order');
    
    setAdvanceAmountDialogOpen(true);
    
    toast({
      title: "Order Created",
      description: `Order #${newOrder.orderId} has been created for ${customer.customerName}`
    });
  };
  
  const handleAdvanceAmountSubmit = () => {
    if (!selectedOrder) return;
    
    const updatedOrder = { ...selectedOrder, advanceAmount };
    
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
    
    updateInventoryFromOrder(selectedOrder, 'cancel');
    
    const updatedOrder = {
      ...modifyForm,
      products: validProducts
    };
    
    updateInventoryFromOrder(updatedOrder, 'order');
    
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
    
    if (status === 'cancelled') {
      updateInventoryFromOrder(selectedOrder, 'cancel');
    }
    
    if (status === 'completed') {
      const salesId = getNextOrderId('S');
      
      updateInventoryFromOrder(selectedOrder, 'complete');
      
      const updatedOrder = { 
        ...selectedOrder, 
        status, 
        salesId 
      };
      
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
    
    const updatedOrder = { ...selectedOrder, status };
    
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
  
  const orderedDates = Object.keys(calendarOrders);
  
  const renderDayContent = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const dayOrders = calendarOrders[dateString] || [];
    
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
  
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const selectedDateOrders = calendarOrders[selectedDateString] || [];
  
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
          <CardContent>
            <OrderCalendar
              selectedDate={selectedDate}
              onDateSelect={(date) => date && setSelectedDate(date)}
              calendarOrders={calendarOrders}
            />
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-2">
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
        <OrderDetails
          order={selectedOrder}
          onModifyOrder={handleModifyOrder}
          onUpdateStatus={updateOrderStatus}
        />
      )}
      
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Order</DialogTitle>
            <DialogDescription>
              Add a new order for delivery.
            </DialogDescription>
          </DialogHeader>
          
          <OrderForm
            customers={customers}
            availableProducts={products}
            orderForm={orderForm}
            onCustomerChange={handleCustomerChange}
            onOrderDateChange={handleOrderDateChange}
            onProductChange={handleProductChange}
            onQuantityChange={handleQuantityChange}
            onPriceChange={handlePriceChange}
            onRemarksChange={(remarks) => setOrderForm({...orderForm, remarks})}
            onAddProduct={addProductRow}
            onRemoveProduct={removeProductRow}
          />
          
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modify Order #{modifyForm?.orderId}</DialogTitle>
            <DialogDescription>
              Update order details for {modifyForm?.customerName}.
            </DialogDescription>
          </DialogHeader>
          
          {modifyForm && (
            <>
              <OrderForm
                customers={customers}
                availableProducts={products}
                orderForm={{
                  customerId: modifyForm.customerId.toString(),
                  orderDate: modifyForm.orderDate,
                  products: modifyForm.products,
                  remarks: modifyForm.remarks
                }}
                onCustomerChange={(customerId) => setModifyForm({
                  ...modifyForm,
                  customerId: parseInt(customerId)
                })}
                onOrderDateChange={(date) => setModifyForm({
                  ...modifyForm,
                  orderDate: format(date, 'yyyy-MM-dd')
                })}
                onProductChange={handleModifyProductChange}
                onQuantityChange={handleModifyQuantityChange}
                onPriceChange={handleModifyPriceChange}
                onRemarksChange={(remarks) => setModifyForm({
                  ...modifyForm,
                  remarks
                })}
                onAddProduct={addModifyProductRow}
                onRemoveProduct={removeModifyProductRow}
              />
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setModifyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveModifiedOrder}>
                  Save Changes
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Order;
