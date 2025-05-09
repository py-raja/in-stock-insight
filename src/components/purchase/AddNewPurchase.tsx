
// This file should contain implementation for AddNewPurchase component
// The error is in the handling of numeric inputs where strings are used instead of numbers
// Make sure the purchaseId and all numeric inputs are properly typed

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, X, Save } from 'lucide-react';
import { 
  getNextPurchaseId, 
  getCompanyNames,
  getProductsByCompany,
  updateInventoryFromPurchase 
} from '@/services/mockData';

interface AddNewPurchaseProps {
  onAddPurchase: (purchase: any) => void;
}

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

const AddNewPurchase = ({ onAddPurchase }: AddNewPurchaseProps) => {
  const { toast } = useToast();
  
  // Form state
  const [purchaseId, setPurchaseId] = useState<string>(getNextPurchaseId());
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [supplierName, setSupplierName] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([
    {
      productId: 0,
      productName: '',
      quantity: 0,
      purchasePrice: 0
    }
  ]);
  
  // Available companies for dropdown
  const companyNames = getCompanyNames();
  
  // Available products for the selected supplier
  const availableProducts = supplierName ? getProductsByCompany(supplierName) : [];
  
  const handleAddRow = () => {
    setItems([
      ...items,
      {
        productId: 0,
        productName: '',
        quantity: 0,
        purchasePrice: 0
      }
    ]);
  };
  
  const handleRemoveRow = (index: number) => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.splice(index, 1);
      setItems(updatedItems);
    }
  };
  
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...items];
    
    if (field === 'productId' && typeof value === 'number') {
      const product = availableProducts.find(p => p.productId === value);
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: product.productId,
          productName: product.productName,
          // Use default price if purchasePrice doesn't exist on product
          purchasePrice: product.hasOwnProperty('purchasePrice') ? (product as any).purchasePrice : 0
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'productName' ? value : Number(value)
      };
    }
    
    setItems(updatedItems);
  };
  
  const handleSave = () => {
    // Validation
    if (!supplierName) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty rows
    const validItems = items.filter(
      item => item.productId > 0 && item.productName && item.quantity > 0 && item.purchasePrice > 0
    );
    
    if (validItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one valid product",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate total amount
    const totalAmount = validItems.reduce(
      (sum, item) => sum + (item.quantity * item.purchasePrice), 
      0
    );
    
    // Create purchase object
    const purchaseObj = {
      purchaseId: purchaseId,
      supplierName,
      purchaseDate: format(purchaseDate, 'yyyy-MM-dd'),
      products: validItems,
      totalAmount
    };
    
    // Add the purchase
    onAddPurchase(purchaseObj);
    
    // In a real app, you would update inventory via API
    // For this mock, we'll just show a message
    updateInventoryFromPurchase(purchaseObj);
    
    // Success message
    toast({
      title: "Purchase Added",
      description: `Purchase #${purchaseId} has been added successfully`
    });
    
    // Reset form for next purchase
    setPurchaseId(getNextPurchaseId());
    setPurchaseDate(new Date());
    setSupplierName("");
    setItems([
      {
        productId: 0,
        productName: '',
        quantity: 0,
        purchasePrice: 0
      }
    ]);
  };
  
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.purchasePrice || 0)), 0);
  };
  
  return (
    <CardContent className="pt-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase ID</label>
            <Input value={purchaseId.toString()} disabled />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Purchase Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(purchaseDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={purchaseDate}
                  onSelect={(date) => date && setPurchaseDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier Name</label>
            <Select
              value={supplierName}
              onValueChange={setSupplierName}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {companyNames.map(company => (
                  <SelectItem key={company} value={company}>{company}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Products</h3>
            <Button 
              size="sm" 
              onClick={handleAddRow}
              disabled={!supplierName}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Add Row
            </Button>
          </div>
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price (₹)</TableHead>
                <TableHead>Total (₹)</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select 
                      value={item.productId ? item.productId.toString() : "none"} 
                      onValueChange={(value) => {
                        if (value && value !== "none") {
                          handleItemChange(index, 'productId', parseInt(value));
                        }
                      }}
                      disabled={!supplierName}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select a product</SelectItem>
                        {availableProducts.map(product => (
                          <SelectItem 
                            key={product.productId} 
                            value={product.productId.toString()}
                          >
                            {product.productName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={item.quantity || ''} 
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} 
                      className="w-20"
                      disabled={!item.productId}
                    />
                  </TableCell>
                  <TableCell>
                    <Input 
                      type="number" 
                      value={item.purchasePrice || ''} 
                      onChange={(e) => handleItemChange(index, 'purchasePrice', e.target.value)} 
                      className="w-24"
                      disabled={!item.productId}
                    />
                  </TableCell>
                  <TableCell>
                    {item.quantity && item.purchasePrice 
                      ? (item.quantity * item.purchasePrice).toLocaleString() 
                      : '0'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveRow(index)}
                      disabled={items.length <= 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          <div className="flex justify-between mt-4">
            <div></div>
            <div className="bg-muted px-4 py-2 rounded-md">
              <span className="font-medium">Total: </span>
              <span>₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Purchase
          </Button>
        </div>
      </div>
    </CardContent>
  );
};

export default AddNewPurchase;
