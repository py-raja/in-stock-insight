
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
import { CalendarIcon, PlusCircle, Trash2, Save, Edit, Search, Database, Server, User } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import TabsContainer from '@/components/common/TabsContent';
import DataTable from '@/components/common/DataTable';
import { suppliers, supplierTransactions, getNextSupplierId } from '@/services/mockData';
import { Supplier, SupplierTransaction } from '@/types/supplier';

const SupplierPage: React.FC = () => {
  const { toast } = useToast();
  // SQL equivalent: SELECT * FROM suppliers ORDER BY supplier_name;
  const [suppliersData, setSuppliersData] = useState<Supplier[]>([...suppliers]);
  
  // SQL equivalent: 
  // SELECT st.*, s.supplier_name 
  // FROM supplier_transactions st
  // JOIN suppliers s ON st.supplier_id = s.supplier_id
  // ORDER BY st.date DESC;
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
  
  // Add transaction dialog
  const [addTransactionDialogOpen, setAddTransactionDialogOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Partial<SupplierTransaction>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    supplierId: 0,
    supplierName: '',
    openingAmount: 0,
    billAmount: 0,
    paid: 0,
    damage: 0,
    crateOpening: 0,
    crateSupply: 0,
    crateReturn: 0
  });
  
  const handleAddSupplier = () => {
    // SQL equivalent: INSERT INTO suppliers (supplier_name) VALUES ($1) RETURNING supplier_id;
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
    // SQL equivalent: UPDATE suppliers SET supplier_name=$1 WHERE supplier_id=$2;
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
    // SQL equivalent: DELETE FROM suppliers WHERE supplier_id IN ($1, $2, ...);
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
  
  const handleAddTransaction = () => {
    // SQL equivalent: 
    // INSERT INTO supplier_transactions 
    // (supplier_id, date, opening_amount, bill_amount, paid, damage, balance, crate_opening, crate_supply, crate_return, crate_balance) 
    // VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    // RETURNING transaction_id;
    
    if (!newTransaction.supplierId) {
      toast({
        title: "Validation Error",
        description: "Please select a supplier",
        variant: "destructive"
      });
      return;
    }
    
    const selectedSupplierData = suppliersData.find(s => s.supplierId === newTransaction.supplierId);
    if (!selectedSupplierData) return;
    
    // Calculate balance and crate balance
    const balance = (newTransaction.openingAmount || 0) + 
                   (newTransaction.billAmount || 0) - 
                   (newTransaction.paid || 0) - 
                   (newTransaction.damage || 0);
                   
    const crateBalance = (newTransaction.crateOpening || 0) + 
                        (newTransaction.crateSupply || 0) - 
                        (newTransaction.crateReturn || 0);
    
    // Create new transaction with calculated fields
    const transactionToAdd: SupplierTransaction = {
      transactionId: `ST${format(new Date(), 'yyyyMMdd')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      supplierId: newTransaction.supplierId,
      supplierName: selectedSupplierData.supplierName,
      date: newTransaction.date || format(new Date(), 'yyyy-MM-dd'),
      openingAmount: newTransaction.openingAmount || 0,
      billAmount: newTransaction.billAmount || 0,
      paid: newTransaction.paid || 0,
      damage: newTransaction.damage || 0,
      balance: balance,
      crateOpening: newTransaction.crateOpening || 0,
      crateSupply: newTransaction.crateSupply || 0,
      crateReturn: newTransaction.crateReturn || 0,
      crateBalance: crateBalance
    };
    
    // Add to transactions
    setTransactions([transactionToAdd, ...transactions]);
    
    // Update supplier balance
    const updatedSuppliers = suppliersData.map(supplier => {
      if (supplier.supplierId === newTransaction.supplierId) {
        return {
          ...supplier,
          balanceAmount: balance,
          crateBalance: crateBalance
        };
      }
      return supplier;
    });
    
    setSuppliersData(updatedSuppliers);
    
    // Reset form and close dialog
    setNewTransaction({
      date: format(new Date(), 'yyyy-MM-dd'),
      supplierId: 0,
      supplierName: '',
      openingAmount: 0,
      billAmount: 0,
      paid: 0,
      damage: 0,
      crateOpening: 0,
      crateSupply: 0,
      crateReturn: 0
    });
    
    setAddTransactionDialogOpen(false);
    
    toast({
      title: "Transaction Added",
      description: `Transaction for ${selectedSupplierData.supplierName} has been added successfully`
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
  // SQL equivalent:
  // SELECT st.*, s.supplier_name 
  // FROM supplier_transactions st
  // JOIN suppliers s ON st.supplier_id = s.supplier_id
  // WHERE ($1::int IS NULL OR st.supplier_id = $1)
  // AND ($2::date IS NULL OR st.date = $2)
  // ORDER BY st.date DESC, st.supplier_name;
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
          <Button onClick={() => startAction('add')}>
            <User className="h-4 w-4 mr-2" />
            Add
          </Button>
          <Button variant="outline" onClick={() => startAction('modify')}>
            <Edit className="h-4 w-4 mr-2" />
            Modify
          </Button>
          <Button variant="destructive" onClick={() => startAction('delete')}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
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
        
        <div className="flex items-end space-x-2">
          <Button className="mt-auto" onClick={() => {
            setSelectedSupplier(null);
            setSelectedDate(new Date());
          }}>
            Reset Filters
          </Button>
          
          <Button 
            className="mt-auto" 
            onClick={() => setAddTransactionDialogOpen(true)}
            variant="default"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
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
      
      {/* Add Transaction Dialog */}
      <Dialog open={addTransactionDialogOpen} onOpenChange={setAddTransactionDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>
              Enter transaction details for the supplier.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <Select
                value={newTransaction.supplierId ? newTransaction.supplierId.toString() : ''}
                onValueChange={(value) => {
                  const supplierId = parseInt(value);
                  const supplier = suppliersData.find(s => s.supplierId === supplierId);
                  setNewTransaction({
                    ...newTransaction,
                    supplierId,
                    supplierName: supplier?.supplierName || '',
                    openingAmount: supplier?.balanceAmount || 0,
                    crateOpening: supplier?.crateBalance || 0
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliersData.map(supplier => (
                    <SelectItem 
                      key={supplier.supplierId} 
                      value={supplier.supplierId.toString()}
                    >
                      {supplier.supplierName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTransaction.date ? format(new Date(newTransaction.date), "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={newTransaction.date ? new Date(newTransaction.date) : undefined}
                    onSelect={(date) => date && setNewTransaction({
                      ...newTransaction,
                      date: format(date, 'yyyy-MM-dd')
                    })}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Opening Amount</label>
              <Input
                type="number"
                value={newTransaction.openingAmount || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  openingAmount: Number(e.target.value)
                })}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bill Amount</label>
              <Input
                type="number"
                value={newTransaction.billAmount || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  billAmount: Number(e.target.value)
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Paid Amount</label>
              <Input
                type="number"
                value={newTransaction.paid || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  paid: Number(e.target.value)
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Damage Amount</label>
              <Input
                type="number"
                value={newTransaction.damage || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  damage: Number(e.target.value)
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Crate Opening</label>
              <Input
                type="number"
                value={newTransaction.crateOpening || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  crateOpening: Number(e.target.value)
                })}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Crate Supply</label>
              <Input
                type="number"
                value={newTransaction.crateSupply || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  crateSupply: Number(e.target.value)
                })}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Crate Return</label>
              <Input
                type="number"
                value={newTransaction.crateReturn || 0}
                onChange={(e) => setNewTransaction({
                  ...newTransaction,
                  crateReturn: Number(e.target.value)
                })}
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Preview Balance</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="text-sm font-medium">Amount Balance:</div>
                  <div className="text-lg">
                    ₹{(newTransaction.openingAmount || 0) + 
                      (newTransaction.billAmount || 0) - 
                      (newTransaction.paid || 0) - 
                      (newTransaction.damage || 0)}
                  </div>
                </div>
                <div className="p-4 border rounded-md">
                  <div className="text-sm font-medium">Crate Balance:</div>
                  <div className="text-lg">
                    {(newTransaction.crateOpening || 0) + 
                     (newTransaction.crateSupply || 0) - 
                     (newTransaction.crateReturn || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTransactionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTransaction} disabled={!newTransaction.supplierId}>
              <Server className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
