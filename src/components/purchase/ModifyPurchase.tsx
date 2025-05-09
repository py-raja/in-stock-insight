
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
import { supabase } from '@/integrations/supabase/client';

interface ModifyPurchaseProps {
  purchases: any[];
  onModifyPurchase: (purchase: any) => void;
  onDeletePurchase: (purchaseId: number) => void;
  selectedPurchaseId?: number | null;
}

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

interface Product {
  productId: number;
  productName: string;
  purchasePrice?: number;
}

const ModifyPurchase = ({ purchases, onModifyPurchase, onDeletePurchase, selectedPurchaseId }: ModifyPurchaseProps) => {
  const { toast } = useToast();
  
  // Search and selected purchase
  const [searchPurchaseId, setSearchPurchaseId] = useState('');
  const [selectedPurchase, setSelectedPurchase] = useState<any | null>(null);
  
  // Modified purchase data
  const [modifiedDate, setModifiedDate] = useState<Date | null>(null);
  const [modifiedItems, setModifiedItems] = useState<PurchaseItem[]>([]);
  const [originalItems, setOriginalItems] = useState<PurchaseItem[]>([]);
  
  // Available products
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  
  // For now, we'll create mock products since we haven't set up the products table
  useEffect(() => {
    const mockProducts: Product[] = [
      { productId: 1, productName: "Apples", purchasePrice: 10 },
      { productId: 2, productName: "Oranges", purchasePrice: 15 },
      { productId: 3, productName: "Bananas", purchasePrice: 8 },
      { productId: 4, productName: "Grapes", purchasePrice: 20 },
      { productId: 5, productName: "Strawberries", purchasePrice: 25 }
    ];
    
    setAvailableProducts(mockProducts);
  }, []);
  
  // Effect to handle when selectedPurchaseId prop changes
  useEffect(() => {
    if (selectedPurchaseId) {
      const foundPurchase = purchases.find(p => Number(p.purchaseId) === selectedPurchaseId);
      if (foundPurchase) {
        setSelectedPurchase(foundPurchase);
      }
    }
  }, [selectedPurchaseId, purchases]);
  
  // When a purchase is selected, initialize the form
  useEffect(() => {
    if (selectedPurchase) {
      setModifiedDate(selectedPurchase.purchaseDate ? new Date(selectedPurchase.purchaseDate) : new Date());
      setModifiedItems([...selectedPurchase.products]);
      setOriginalItems([...selectedPurchase.products]);
      setSearchPurchaseId(selectedPurchase.purchaseId.toString());
    } else {
      setModifiedDate(null);
      setModifiedItems([]);
      setOriginalItems([]);
    }
  }, [selectedPurchase]);
  
  const handleSearch = async () => {
    if (!searchPurchaseId.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a purchase ID",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .select(`
          purchase_id,
          supplier_id,
          purchase_date,
          total_amount,
          suppliers (supplier_name)
        `)
        .eq('purchase_id', searchPurchaseId.trim())
        .single();
      
      if (purchaseError) {
        throw purchaseError;
      }
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('purchase_items')
        .select('*')
        .eq('purchase_id', purchaseData.purchase_id);
        
      if (itemsError) {
        throw itemsError;
      }
      
      const formattedPurchase = {
        purchaseId: purchaseData.purchase_id,
        supplierId: purchaseData.supplier_id,
        supplierName: purchaseData.suppliers.supplier_name,
        purchaseDate: purchaseData.purchase_date,
        totalAmount: purchaseData.total_amount,
        products: itemsData.map((item: any) => ({
          productId: item.product_id,
          productName: item.product_name,
          quantity: item.quantity,
          purchasePrice: item.purchase_price,
        }))
      };
      
      setSelectedPurchase(formattedPurchase);
    } catch (error) {
      console.error('Error searching purchase:', error);
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
    
    // Create modified purchase object
    const modifiedPurchase = {
      ...selectedPurchase,
      purchaseDate: format(modifiedDate, 'yyyy-MM-dd'),
      products: validItems,
      totalAmount
    };
    
    // Update the purchase
    onModifyPurchase(modifiedPurchase);
  };
  
  const handleDeletePurchase = () => {
    if (!selectedPurchase) return;
    
    // Delete the purchase
    onDeletePurchase(Number(selectedPurchase.purchaseId));
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
