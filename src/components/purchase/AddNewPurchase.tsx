
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
import { CalendarIcon, PlusCircle, X, Save } from 'lucide-react';
import { getNextPurchaseId, getCompanyNames, getProductsByCompany, suppliers } from '@/services/mockData';

interface AddNewPurchaseProps {
  onAddPurchase: (purchase: any) => void;
}

interface PurchaseItem {
  productId: number;
  productName: string;
  quantity: number;
  purchasePrice: number;
}

interface CrateDetails {
  opening: number;
  supply: number;
  returned: number;
  balance: number;
}

const AddNewPurchase = ({ onAddPurchase }: AddNewPurchaseProps) => {
  const { toast } = useToast();
  
  // Purchase form state
  const [purchaseId, setPurchaseId] = useState<number>(getNextPurchaseId());
  const [purchaseDate, setPurchaseDate] = useState<Date>(new Date());
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>(Array(5).fill(null).map(() => ({
    productId: 0,
    productName: '',
    quantity: 0,
    purchasePrice: 0
  })));
  
  // Crate details
  const [crateDetails, setCrateDetails] = useState<CrateDetails>({
    opening: 0,
    supply: 0,
    returned: 0,
    balance: 0
  });
  
  // Company names for dropdown
  const companyNames = getCompanyNames();
  
  // Available products for selected company
  const availableProducts = selectedCompany 
    ? getProductsByCompany(selectedCompany) 
    : [];
  
  // Update crate opening balance when supplier changes
  useEffect(() => {
    if (selectedCompany) {
      const supplier = suppliers.find(s => s.supplierName === selectedCompany);
      if (supplier) {
        setCrateDetails(prev => ({
          ...prev,
          opening: supplier.crateBalance || 0,
          balance: supplier.crateBalance || 0
        }));
      }
    } else {
      setCrateDetails({
        opening: 0,
        supply: 0,
        returned: 0,
        balance: 0
      });
    }
  }, [selectedCompany]);
  
  // Update crate balance when supply or return changes
  useEffect(() => {
    const newBalance = crateDetails.opening + crateDetails.supply - crateDetails.returned;
    setCrateDetails(prev => ({
      ...prev,
      balance: newBalance
    }));
  }, [crateDetails.opening, crateDetails.supply, crateDetails.returned]);
  
  const handleAddRow = () => {
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: 0,
        productName: '',
        quantity: 0,
        purchasePrice: 0
      }
    ]);
  };
  
  const handleRemoveRow = (index: number) => {
    const updatedItems = [...purchaseItems];
    updatedItems.splice(index, 1);
    setPurchaseItems(updatedItems);
  };
  
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    const updatedItems = [...purchaseItems];
    
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
    
    setPurchaseItems(updatedItems);
  };
  
  const handleCreatePurchase = () => {
    // Validation
    if (!selectedCompany) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }
    
    // Filter out empty rows
    const validItems = purchaseItems.filter(
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
    
    // Create purchase object
    const newPurchase = {
      purchaseId,
      supplierName: selectedCompany,
      purchaseDate: format(purchaseDate, 'yyyy-MM-dd'),
      products: validItems,
      totalAmount,
      crateDetails
    };
    
    // Update inventory (in a real app, this would be an API call)
    // But for this mock, we'll just add a toast message
    toast({
      title: "Inventory Updated",
      description: `Added ${validItems.reduce((sum, item) => sum + item.quantity, 0)} items to inventory`
    });
    
    // Add the purchase
    onAddPurchase(newPurchase);
    
    // Reset form with new purchase ID
    setPurchaseId(getNextPurchaseId() + 1);
    setSelectedCompany('');
    setPurchaseDate(new Date());
    setPurchaseItems(Array(5).fill(null).map(() => ({
      productId: 0,
      productName: '',
      quantity: 0,
      purchasePrice: 0
    })));
    setCrateDetails({
      opening: 0,
      supply: 0,
      returned: 0,
      balance: 0
    });
    
    // Success message
    toast({
      title: "Purchase Created",
      description: `Purchase #${purchaseId} has been created successfully`
    });
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
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Supplier Name</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
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
        
        {/* Crate details */}
        {selectedCompany && (
          <div className="border rounded-md p-4 bg-muted/30">
            <h3 className="font-medium mb-2">Crate Details</h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-sm">Opening</label>
                <Input 
                  type="number" 
                  value={crateDetails.opening} 
                  disabled 
                />
              </div>
              <div>
                <label className="text-sm">Supply</label>
                <Input 
                  type="number" 
                  value={crateDetails.supply} 
                  onChange={(e) => setCrateDetails({...crateDetails, supply: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm">Return</label>
                <Input 
                  type="number" 
                  value={crateDetails.returned} 
                  onChange={(e) => setCrateDetails({...crateDetails, returned: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm">Balance</label>
                <Input 
                  type="number" 
                  value={crateDetails.balance} 
                  disabled 
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Product items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Products</h3>
            <Button 
              size="sm" 
              onClick={handleAddRow}
              disabled={!selectedCompany || availableProducts.length === 0}
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
              {purchaseItems.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select 
                      value={item.productId ? item.productId.toString() : "none"} 
                      onValueChange={(value) => {
                        if (value && value !== "none") {
                          handleItemChange(index, 'productId', parseInt(value));
                        }
                      }}
                      disabled={!selectedCompany || availableProducts.length === 0}
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
                {purchaseItems.reduce(
                  (sum, item) => sum + (item.quantity || 0) * (item.purchasePrice || 0), 
                  0
                ).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handleCreatePurchase}>
            <Save className="h-4 w-4 mr-2" />
            Create Purchase
          </Button>
        </div>
      </div>
    </CardContent>
  );
};

export default AddNewPurchase;
