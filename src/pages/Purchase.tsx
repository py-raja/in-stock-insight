
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import PageHeader from '@/components/common/PageHeader';
import DataTable from '@/components/common/DataTable';
import { getPurchasesFromDetails, getNextPurchaseId, getCompanyNames, getProductsByCompany } from '@/services/mockData';
import { PlusCircle, X, Save } from 'lucide-react';

const Purchase = () => {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState(getPurchasesFromDetails());
  
  // New purchase form state
  const [showNewPurchaseForm, setShowNewPurchaseForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [purchaseItems, setPurchaseItems] = useState<Array<{
    productId: number;
    productName: string;
    quantity: number;
    purchasePrice: number;
  }>>([]);
  
  // Company names for dropdown
  const companyNames = getCompanyNames();
  
  // Available products for selected company
  const availableProducts = selectedCompany 
    ? getProductsByCompany(selectedCompany) 
    : [];
  
  const handleAddPurchaseItem = () => {
    if (availableProducts.length === 0) return;
    
    const product = availableProducts[0];
    setPurchaseItems([
      ...purchaseItems,
      {
        productId: product.productId,
        productName: product.productName,
        quantity: 1,
        purchasePrice: 0
      }
    ]);
  };
  
  const handleRemovePurchaseItem = (index: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
  };
  
  const handlePurchaseItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...purchaseItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: typeof value === 'string' && field !== 'productName' ? parseFloat(value) : value
    };
    setPurchaseItems(updatedItems);
  };
  
  const handleCreatePurchase = () => {
    // Validation
    if (!selectedCompany) {
      toast({
        title: "Validation Error",
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }
    
    if (purchaseItems.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please add at least one product",
        variant: "destructive"
      });
      return;
    }
    
    const invalidItems = purchaseItems.filter(
      item => item.quantity <= 0 || item.purchasePrice <= 0
    );
    
    if (invalidItems.length > 0) {
      toast({
        title: "Validation Error",
        description: "All products must have valid quantity and price",
        variant: "destructive"
      });
      return;
    }
    
    // Calculate total
    const totalAmount = purchaseItems.reduce(
      (sum, item) => sum + (item.quantity * item.purchasePrice), 
      0
    );
    
    // Create new purchase
    const newPurchase = {
      purchaseId: getNextPurchaseId(),
      supplierName: selectedCompany,
      purchaseDate,
      products: purchaseItems,
      totalAmount
    };
    
    // Update state
    setPurchases([newPurchase, ...purchases]);
    
    // Reset form
    setSelectedCompany('');
    setPurchaseDate(format(new Date(), 'yyyy-MM-dd'));
    setPurchaseItems([]);
    setShowNewPurchaseForm(false);
    
    // Notify user
    toast({
      title: "Purchase Created",
      description: `Purchase ${newPurchase.purchaseId} has been created successfully`
    });
  };
  
  // DataTable columns
  const columns = [
    { header: 'Purchase ID', accessorKey: 'purchaseId' },
    { header: 'Supplier', accessorKey: 'supplierName' },
    { header: 'Date', accessorKey: 'purchaseDate' },
    { header: 'Total Amount', accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}` },
    { 
      header: 'Actions', 
      accessorKey: (row: any) => (
        <Button variant="ghost" size="sm" onClick={() => {
          // View purchase details (placeholder)
          toast({
            title: "View Purchase",
            description: `Viewing details for ${row.purchaseId}`
          });
        }}>
          View
        </Button>
      )
    }
  ];
  
  return (
    <div>
      <PageHeader 
        title="Purchase Management" 
        subtitle="Record and manage product purchases"
        actions={
          <Button onClick={() => setShowNewPurchaseForm(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            New Purchase
          </Button>
        }
      />
      
      <Dialog open={showNewPurchaseForm} onOpenChange={setShowNewPurchaseForm}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create New Purchase</DialogTitle>
            <DialogDescription>
              Enter the details for the new purchase.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Supplier</label>
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
              
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Purchase Date</label>
                <Input 
                  type="date" 
                  value={purchaseDate} 
                  onChange={(e) => setPurchaseDate(e.target.value)} 
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">Products</h3>
                <Button 
                  size="sm" 
                  onClick={handleAddPurchaseItem}
                  disabled={!selectedCompany || availableProducts.length === 0}
                >
                  <PlusCircle className="h-4 w-4 mr-1" /> Add Product
                </Button>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Select 
                          value={item.productId.toString()} 
                          onValueChange={(value) => {
                            const product = availableProducts.find(
                              p => p.productId.toString() === value
                            );
                            if (product) {
                              handlePurchaseItemChange(index, 'productId', product.productId);
                              handlePurchaseItemChange(index, 'productName', product.productName);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
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
                          value={item.quantity} 
                          onChange={(e) => handlePurchaseItemChange(index, 'quantity', e.target.value)} 
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input 
                          type="number" 
                          value={item.purchasePrice} 
                          onChange={(e) => handlePurchaseItemChange(index, 'purchasePrice', e.target.value)} 
                          className="w-24"
                        />
                      </TableCell>
                      <TableCell>
                        ₹{(item.quantity * item.purchasePrice).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemovePurchaseItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {purchaseItems.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                        {!selectedCompany 
                          ? "Select a supplier to add products" 
                          : "Click 'Add Product' to add items to this purchase"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              
              {purchaseItems.length > 0 && (
                <div className="flex justify-end mt-2">
                  <div className="bg-muted px-4 py-2 rounded-md">
                    <span className="font-medium">Total: </span>
                    <span>₹
                      {purchaseItems.reduce(
                        (sum, item) => sum + (item.quantity * item.purchasePrice), 
                        0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPurchaseForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePurchase}>
              <Save className="h-4 w-4 mr-2" />
              Create Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Card>
        <CardContent className="pt-6">
          <DataTable 
            data={purchases}
            columns={columns}
            emptyMessage="No purchases found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Purchase;
