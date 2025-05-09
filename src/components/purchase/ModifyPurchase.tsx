
import React, { useState, useEffect } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, X, Save, Trash2, Search } from 'lucide-react';
import { getProductsByCompany } from '@/services/mockData';

interface ModifyPurchaseProps {
  purchases: any[];
  onModifyPurchase: (purchase: any) => void;
  onDeletePurchase: (purchaseId: number) => void;
}

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

const ModifyPurchase = ({ purchases, onModifyPurchase, onDeletePurchase }: ModifyPurchaseProps) => {
  const { toast } = useToast();
  
  // Search and selected purchase
  const [searchPurchaseId, setSearchPurchaseId] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  
  // Modified purchase data
  const [modifiedDate, setModifiedDate] = useState<Date | null>(null);
  const [modifiedItems, setModifiedItems] = useState<PurchaseItem[]>([]);
  const [originalItems, setOriginalItems] = useState<PurchaseItem[]>([]);
  
  // Available products for the selected supplier
  const availableProducts = selectedPurchase 
    ? getProductsByCompany(selectedPurchase.supplierName) 
    : [];
  
  // When a purchase is selected, initialize the form
  useEffect(() => {
    if (selectedPurchase) {
      setModifiedDate(selectedPurchase.purchaseDate ? new Date(selectedPurchase.purchaseDate) : new Date());
      setModifiedItems([...selectedPurchase.products]);
      setOriginalItems([...selectedPurchase.products]);
    } else {
      setModifiedDate(null);
      setModifiedItems([]);
      setOriginalItems([]);
    }
  }, [selectedPurchase]);
  
  const handleSearch = () => {
    if (!searchPurchaseId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a purchase ID",
        variant: "destructive"
      });
      return;
    }
    
    const foundPurchase = purchases.find(p => p.purchaseId.toString() === searchPurchaseId.trim());
    
    if (foundPurchase) {
      setSelectedPurchase(foundPurchase);
    } else {
      toast({
        title: "Not Found",
        description: `Purchase with ID ${searchPurchaseId} not found`,
        variant: "destructive"
      });
    }
  };
  
  const handleAddRow = () => {
    setModifiedItems([
      ...modifiedItems,
      {
        productId: 0,
        productName: '',
        quantity: 0,
        purchasePrice: 0
      }
    ]);
  };
  
  const handleRemoveRow = (index: number) => {
    const updatedItems = [...modifiedItems];
    updatedItems.splice(index, 1);
    setModifiedItems(updatedItems);
  };
  
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...modifiedItems];
    
    if (field === 'productId' && typeof value === 'number') {
      const product = availableProducts.find(p => p.productId === value);
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: product.productId,
          productName: product.productName,
          purchasePrice: updatedItems[index].purchasePrice || 
                         (product.hasOwnProperty('purchasePrice') ? (product as any).purchasePrice : 0)
        };
      }
    } else {
      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'productName' ? value : Number(value)
      };
    }
    
    setModifiedItems(updatedItems);
  };
  
  const handleSaveChanges = () => {
    if (!selectedPurchase || !modifiedDate) return;
    
    // Filter out empty rows
    const validItems = modifiedItems.filter(
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
    
    // Calculate total
    const totalAmount = validItems.reduce(
      (sum, item) => sum + (item.quantity * item.purchasePrice), 
      0
    );
    
    // Update inventory (in a real app, this would be an API call)
    // For this mock, we'll just show what changes would happen
    const inventoryUpdates = [];
    
    // Items removed or quantity decreased
    for (const original of originalItems) {
      const modified = validItems.find(item => item.productId === original.productId);
      if (!modified) {
        // Item removed
        inventoryUpdates.push(`Removed ${original.quantity} of ${original.productName}`);
      } else if (modified.quantity < original.quantity) {
        // Quantity decreased
        inventoryUpdates.push(`Decreased ${original.productName} by ${original.quantity - modified.quantity}`);
      }
    }
    
    // Items added or quantity increased
    for (const modified of validItems) {
      const original = originalItems.find(item => item.productId === modified.productId);
      if (!original) {
        // Item added
        inventoryUpdates.push(`Added ${modified.quantity} of ${modified.productName}`);
      } else if (modified.quantity > original.quantity) {
        // Quantity increased
        inventoryUpdates.push(`Increased ${modified.productName} by ${modified.quantity - original.quantity}`);
      }
    }
    
    // Create modified purchase object
    const modifiedPurchase = {
      ...selectedPurchase,
      purchaseDate: format(modifiedDate, 'yyyy-MM-dd'),
      products: validItems,
      totalAmount
    };
    
    // Update the purchase
    onModifyPurchase(modifiedPurchase);
    
    // Show updates
    if (inventoryUpdates.length > 0) {
      toast({
        title: "Inventory Updated",
        description: (
          <ul className="list-disc pl-4 mt-2">
            {inventoryUpdates.map((update, i) => (
              <li key={i}>{update}</li>
            ))}
          </ul>
        )
      });
    }
    
    // Success message
    toast({
      title: "Purchase Modified",
      description: `Purchase #${selectedPurchase.purchaseId} has been updated successfully`
    });
    
    // Reset
    setSearchPurchaseId('');
    setSelectedPurchase(null);
  };
  
  const handleDeletePurchase = () => {
    if (!selectedPurchase) return;
    
    // Delete the purchase
    onDeletePurchase(selectedPurchase.purchaseId);
    
    // Show inventory updates
    toast({
      title: "Inventory Updated",
      description: `Removed ${selectedPurchase.products.length} products from inventory`
    });
    
    // Success message
    toast({
      title: "Purchase Deleted",
      description: `Purchase #${selectedPurchase.purchaseId} has been deleted successfully`
    });
    
    // Reset
    setSearchPurchaseId('');
    setSelectedPurchase(null);
  };
  
  return (
    <CardContent className="pt-6">
      <div className="space-y-6">
        {/* Search section */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1">
            <label className="text-sm font-medium">Enter Purchase ID</label>
            <div className="mt-1">
              <Input
                type="text"
                placeholder="Enter purchase ID to modify"
                value={searchPurchaseId}
                onChange={(e) => setSearchPurchaseId(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Find Purchase
          </Button>
        </div>
        
        {selectedPurchase && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Purchase ID</label>
                <Input value={selectedPurchase.purchaseId.toString()} disabled />
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
                      {modifiedDate ? format(modifiedDate, 'PPP') : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={modifiedDate || undefined}
                      onSelect={(date) => date && setModifiedDate(date)}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier Name</label>
                <Input value={selectedPurchase.supplierName} disabled />
              </div>
            </div>
            
            {/* Product items */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Products</h3>
                <Button 
                  size="sm" 
                  onClick={handleAddRow}
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
                  {modifiedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select 
                          value={item.productId ? item.productId.toString() : "none"} 
                          onValueChange={(value) => {
                            if (value && value !== "none") {
                              handleItemChange(index, 'productId', parseInt(value));
                            }
                          }}
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
                  <span>₹
                    {modifiedItems.reduce(
                      (sum, item) => sum + (item.quantity || 0) * (item.purchasePrice || 0), 
                      0
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="destructive" onClick={handleDeletePurchase}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Purchase
              </Button>
              <Button onClick={handleSaveChanges}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </>
        )}
      </div>
    </CardContent>
  );
};

export default ModifyPurchase;
