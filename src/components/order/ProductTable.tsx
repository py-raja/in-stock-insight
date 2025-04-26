
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/services/mockData';

interface ProductTableProps {
  products: Array<{
    productId: number;
    productName: string;
    salesPrice: number;
    quantity: number;
  }>;
  availableProducts: Product[];
  onProductChange: (index: number, productId: string) => void;
  onQuantityChange: (index: number, quantity: string) => void;
  onPriceChange: (index: number, price: string) => void;
  onRemoveRow: (index: number) => void;
  onAddRow: () => void;
  customerId: string;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  availableProducts,
  onProductChange,
  onQuantityChange,
  onPriceChange,
  onRemoveRow,
  onAddRow,
  customerId
}) => {
  return (
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
          {products.map((product, index) => (
            <tr key={index}>
              <td className="px-4 py-2 whitespace-nowrap">
                <Select
                  value={product.productId ? String(product.productId) : ""}
                  onValueChange={(value) => onProductChange(index, value)}
                  disabled={!customerId}
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
              <td className="px-4 py-2 whitespace-nowrap">
                <Input
                  type="number"
                  value={product.salesPrice || ""}
                  onChange={(e) => onPriceChange(index, e.target.value)}
                  placeholder="Price"
                  disabled={!product.productId}
                  className="w-24"
                />
              </td>
              <td className="px-4 py-2 whitespace-nowrap">
                <Input
                  type="number"
                  value={product.quantity || ""}
                  onChange={(e) => onQuantityChange(index, e.target.value)}
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
                  onClick={() => onRemoveRow(index)}
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
  );
};

export default ProductTable;
