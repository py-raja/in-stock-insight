import React, { useState } from 'react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, PlusCircle, Trash2, Save, Edit, Search } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import TabsContainer from '@/components/common/TabsContent';
import DataTable from '@/components/common/DataTable';
import { suppliers, supplierTransactions, getNextSupplierId } from '@/services/mockData';
import { Supplier, SupplierTransaction } from '@/types/supplier';

const SupplierPage: React.FC = () => {
  const { toast } = useToast();
  const [suppliersData, setSuppliersData] = useState<Supplier[]>([...suppliers]);
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([...supplierTransactions]);
  const [action, setAction] = useState<'add' | 'modify' | 'delete' | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    supplierName: '',
  });
  
  // Add supplier dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Modify supplier dialog
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [supplierToModify, setSupplierToModify] = useState<Supplier | null>(null);
  
  // Delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleAddSupplier = () => {
    if (!newSupplier.supplierName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Supplier name is required",
        variant: "destructive"
      });
      return;
    }
    
    const newId = getNextSupplierId();
    const supplierToAdd: Supplier = {
      supplierId: newId,
      supplierName: newSupplier.supplierName,
      balanceAmount: 0,
      crateBalance: 0
    };
    
    setSuppliersData([...suppliersData, supplierToAdd]);
    setNewSupplier({ supplierName: '' });
    setAddDialogOpen(false);
    
    toast({
      title: "Supplier Added",
      description: `${supplierToAdd.supplierName} has been added successfully`
    });
  };
  
  const handleModifySupplier = () => {
    if (!supplierToModify) return;
    
    const updatedSuppliers = suppliersData.map(supplier => 
      supplier.supplierId === supplierToModify.supplierId ? supplierToModify : supplier
    );
    
    setSuppliersData(updatedSuppliers);
    setModifyDialogOpen(false);
    
    toast({
      title: "Supplier Updated",
      description: `${supplierToModify.supplierName} has been updated successfully`
    });
  };
  
  const handleDeleteSuppliers = () => {
    if (selectedSuppliers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one supplier to delete",
        variant: "destructive"
      });
      return;
    }
    
    const remainingSuppliers = suppliersData.filter(
      supplier => !selectedSuppliers.includes(supplier.supplierId)
    );
    
    setSuppliersData(remainingSuppliers);
    setSelectedSuppliers([]);
    setDeleteDialogOpen(false);
    
    toast({
      title: "Suppliers Deleted",
      description: `${selectedSuppliers.length} supplier(s) have been deleted`
    });
  };
  
  const handleCheckboxChange = (supplierId: number, checked: boolean) => {
    setSelectedSuppliers(prev => 
      checked 
        ? [...prev, supplierId] 
        : prev.filter(id => id !== supplierId)
    );
  };
  
  const startAction = (actionType: 'add' | 'modify' | 'delete') => {
    setAction(actionType);
    
    if (actionType === 'add') {
      setAddDialogOpen(true);
    } else if (actionType === 'modify') {
      setModifyDialogOpen(true);
    } else if (actionType === 'delete') {
      setDeleteDialogOpen(true);
    }
  };
  
  const cancelAction = () => {
    setAction(null);
    setSelectedSuppliers([]);
    setAddDialogOpen(false);
    setModifyDialogOpen(false);
    setDeleteDialogOpen(false);
  };
  
  // Filter transactions based on selected supplier and date
  const filteredTransactions = transactions.filter(transaction => {
    const supplierMatch = selectedSupplier ? transaction.supplierId === selectedSupplier : true;
    const dateMatch = selectedDate ? transaction.date === format(selectedDate, 'yyyy-MM-dd') : true;
    return supplierMatch && dateMatch;
  });
  
  const supplierDetailsColumns = [
    { 
      header: 'ID', 
      accessorKey: 'supplierId' 
    },
    { 
      header: 'Supplier Name', 
      accessorKey: action === 'modify' ? 
        (row: Supplier) => (
          <Input 
            value={row.supplierName} 
            onChange={(e) => {
              const updated = {...row, supplierName: e.target.value};
              setSupplierToModify(updated);
            }}
          />
        ) : 'supplierName'
    },
    { 
      header: 'Balance Amount', 
      accessorKey: (row: Supplier) => `₹${row.balanceAmount}`
    },
    { 
      header: 'Crate Balance', 
      accessorKey: 'crateBalance'
    },
    {
      header: 'Actions',
      accessorKey: action === 'delete' ? 
        (row: Supplier) => (
          <Checkbox 
            checked={selectedSuppliers.includes(row.supplierId)}
            onCheckedChange={(checked) => handleCheckboxChange(row.supplierId, checked === true)}
          />
        ) : 
        (row: Supplier) => (
          <Button variant="ghost" size="sm" onClick={() => {
            setSupplierToModify({...row});
            setModifyDialogOpen(true);
          }}>
            <Edit className="h-4 w-4" />
          </Button>
        )
    }
  ];
  
  const transactionColumns = [
    { header: 'Date', accessorKey: 'date' },
    { header: 'Supplier', accessorKey: 'supplierName' },
    { header: 'Opening', accessorKey: (row: SupplierTransaction) => `₹${row.openingAmount}` },
    { header: 'Bill Amount', accessorKey: (row: SupplierTransaction) => `₹${row.billAmount}` },
    { header: 'Paid', accessorKey: (row: SupplierTransaction) => `₹${row.paid}` },
    { header: 'Damage', accessorKey: (row: SupplierTransaction) => `₹${row.damage}` },
    { header: 'Balance', accessorKey: (row: SupplierTransaction) => `₹${row.balance}` },
    { header: 'Crate Opening', accessorKey: 'crateOpening' },
    { header: 'Crate Supply', accessorKey: 'crateSupply' },
    { header: 'Crate Return', accessorKey: 'crateReturn' },
    { header: 'Crate Balance', accessorKey: 'crateBalance' }
  ];
  
  // Tab content
  const supplierDetailsTab = (
    <div>
      <div className="flex justify-between mb-4">
        <div className="space-x-2">
          <Button onClick={() => startAction('add')}>Add</Button>
          <Button variant="outline" onClick={() => startAction('modify')}>Modify</Button>
          <Button variant="destructive" onClick={() => startAction('delete')}>Delete</Button>
        </div>
        {action && (
          <Button variant="outline" onClick={cancelAction}>Cancel {action}</Button>
        )}
      </div>
      
      <DataTable 
        data={suppliersData} 
        columns={supplierDetailsColumns}
      />
      
      {/* Add Supplier Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
            <DialogDescription>
              Enter the details for the new supplier.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier Name</label>
              <Input
                placeholder="Enter supplier name"
                value={newSupplier.supplierName}
                onChange={(e) => setNewSupplier({...newSupplier, supplierName: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSupplier}>Add Supplier</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modify Supplier Dialog */}
      <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modify Supplier</DialogTitle>
            <DialogDescription>
              Update supplier details.
            </DialogDescription>
          </DialogHeader>
          
          {supplierToModify && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier ID</label>
                <Input value={supplierToModify.supplierId} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier Name</label>
                <Input
                  value={supplierToModify.supplierName}
                  onChange={(e) => setSupplierToModify({
                    ...supplierToModify,
                    supplierName: e.target.value
                  })}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setModifyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleModifySupplier}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the selected supplier(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteSuppliers}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
  
  const supplierTransactionsTab = (
    <div>
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Supplier</label>
          <Select 
            value={selectedSupplier?.toString() || ''} 
            onValueChange={(value) => setSelectedSupplier(value ? parseInt(value) : null)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliersData.map(supplier => (
                <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                  {supplier.supplierName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[200px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <Button className="mt-auto" onClick={() => {
          setSelectedSupplier(null);
          setSelectedDate(new Date());
        }}>
          Reset Filters
        </Button>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <DataTable 
              data={filteredTransactions}
              columns={transactionColumns}
              emptyMessage="No transactions found for the selected filters"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <div>
      <PageHeader 
        title="Supplier Management" 
        subtitle="Manage supplier details and track transactions"
      />
      
      <TabsContainer 
        tabs={[
          {
            value: "details",
            label: "Supplier Details",
            content: supplierDetailsTab
          },
          {
            value: "transactions",
            label: "Supplier Transactions",
            content: supplierTransactionsTab
          }
        ]}
      />
    </div>
  );
};

export default SupplierPage;
