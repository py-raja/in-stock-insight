
import React from 'react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderType } from '@/types/order';

interface OrderDetailsProps {
  order: OrderType;
  onModifyOrder: () => void;
  onUpdateStatus: (status: 'pending' | 'processing' | 'completed' | 'cancelled') => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({
  order,
  onModifyOrder,
  onUpdateStatus,
}) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Order #{order.orderId} Details</span>
          <Badge className={getStatusColor(order.status)}>
            {order.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Customer</h3>
            <p>{order.customerName}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
            <p>{format(new Date(order.orderDate), 'MMMM d, yyyy')}</p>
          </div>
          {order.advanceAmount > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Advance Payment</h3>
              <p className="text-green-600">₹{order.advanceAmount.toLocaleString()}</p>
            </div>
          )}
          {order.salesId && (
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sales ID</h3>
              <p>{order.salesId}</p>
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
                {order.products.map((product, index) => (
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
                    ₹{order.products.reduce((sum, product) => sum + (product.salesPrice * product.quantity), 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {order.remarks && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Remarks</h3>
            <p className="text-sm p-3 bg-gray-50 rounded-md">{order.remarks}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <div>
          {order.status !== 'cancelled' && order.status !== 'completed' && (
            <Button variant="destructive" onClick={() => onUpdateStatus('cancelled')}>
              Cancel Order
            </Button>
          )}
        </div>
        
        <div className="flex space-x-2">
          {order.status === 'pending' && (
            <>
              <Button variant="outline" onClick={onModifyOrder}>
                Modify Order
              </Button>
              <Button onClick={() => onUpdateStatus('completed')}>
                <Check className="h-4 w-4 mr-2" /> Complete Order
              </Button>
            </>
          )}
          
          {(order.status === 'completed' || order.status === 'cancelled') && (
            <Button variant="outline" onClick={() => onUpdateStatus('pending')}>
              Reopen Order
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default OrderDetails;
