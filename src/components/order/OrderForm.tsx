
import React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Customer, Product } from '@/services/mockData';
import ProductTable from './ProductTable';

interface OrderFormProps {
  customers: Customer[];
  availableProducts: Product[];
  orderForm: {
    customerId: string;
    orderDate: string;
    products: Array<{
      productId: number;
      productName: string;
      salesPrice: number;
      quantity: number;
    }>;
    remarks: string;
  };
  onCustomerChange: (customerId: string) => void;
  onOrderDateChange: (date: Date) => void;
  onProductChange: (index: number, productId: string) => void;
  onQuantityChange: (index: number, quantity: string) => void;
  onPriceChange: (index: number, price: string) => void;
  onRemarksChange: (remarks: string) => void;
  onAddProduct: () => void;
  onRemoveProduct: (index: number) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({
  customers,
  availableProducts,
  orderForm,
  onCustomerChange,
  onOrderDateChange,
  onProductChange,
  onQuantityChange,
  onPriceChange,
  onRemarksChange,
  onAddProduct,
  onRemoveProduct,
}) => {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Customer</label>
          <Select
            value={orderForm.customerId}
            onValueChange={onCustomerChange}
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
          <label className="text-sm font-medium">Order Date</label>
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
                  onSelect={(date) => date && onOrderDateChange(date)}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium">Products</label>
          <Button variant="outline" size="sm" onClick={onAddProduct}>
            <PlusCircle className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>
        
        <ProductTable
          products={orderForm.products}
          availableProducts={availableProducts}
          onProductChange={onProductChange}
          onQuantityChange={onQuantityChange}
          onPriceChange={onPriceChange}
          onRemoveRow={onRemoveProduct}
          onAddRow={onAddProduct}
          customerId={orderForm.customerId}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Remarks</label>
        <Textarea
          placeholder="Add any notes or special instructions for this order"
          value={orderForm.remarks}
          onChange={(e) => onRemarksChange(e.target.value)}
          rows={3}
        />
      </div>
    </div>
  );
};

export default OrderForm;
