import React, { useState, useEffect } from 'react';
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
import { CalendarIcon, PlusCircle, Trash2, Save, Edit, Search, Database, Server, User, Loader2 } from 'lucide-react';
import PageHeader from '@/components/common/PageHeader';
import TabsContainer from '@/components/common/TabsContent';
import DataTable from '@/components/common/DataTable';
import { Supplier, SupplierTransaction } from '@/types/supplier';
import { SupplierDB, SupplierTransactionDB } from '@/types/supabase';
import { supabase } from '@/integrations/supabase/client';

const SupplierPage: React.FC = () => {
  const { toast } = useToast();
  
  // State variables for data
  const [suppliersData, setSuppliersData] = useState<Supplier[]>([]);
  const [transactions, setTransactions] = useState<SupplierTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // State variables for UI
  const [action, setAction] = useState<'add' | 'modify' | 'delete' | null>(null);
  const [selectedSuppliers, setSelectedSuppliers] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<number | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    supplierName: '',
  });
  
  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [supplierToModify, setSupplierToModify] = useState<Supplier | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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
  
  // Fetch suppliers and transactions from Supabase
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch suppliers
        const { data: suppliersData, error: suppliersError } = await supabase
          .from('suppliers')
          .select('*')
          .order('supplier_name');
          
        if (suppliersError) {
          throw suppliersError;
        }
        
        // Map DB format to frontend format
        const mappedSuppliers: Supplier[] = suppliersData.map((supplier: SupplierDB) => ({
          supplierId: supplier.supplier_id,
          supplierName: supplier.supplier_name,
          balanceAmount: supplier.balance_amount,
          crateBalance: supplier.crate_balance
        }));
        
        // Fetch transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('supplier_transactions')
          .select('*, suppliers(supplier_name)')
          .order('date', { ascending: false });
          
        if (transactionsError) {
          throw transactionsError;
        }
        
        // Map DB format to frontend format
        const mappedTransactions: SupplierTransaction[] = transactionsData.map((transaction: any) => ({
          transactionId: transaction.transaction_id,
          supplierId: transaction.supplier_id,
          supplierName: transaction.suppliers.supplier_name,
          date: transaction.date,
          openingAmount: transaction.opening_amount,
          billAmount: transaction.bill_amount,
          paid: transaction.paid,
          damage: transaction.damage,
          balance: transaction.balance,
          crateOpening: transaction.crate_opening,
          crateSupply: transaction.crate_supply,
          crateReturn: transaction.crate_return,
          crateBalance: transaction.crate_balance
        }));
        
        setSuppliersData(mappedSuppliers);
        setTransactions(mappedTransactions);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Data Fetch Error",
          description: "Could not load data from the database.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [toast]);
  
  const handleAddSupplier = async () => {
    if (!newSupplier.supplierName?.trim()) {
      toast({
        title: "Validation Error",
        description: "Supplier name is required",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Insert into Supabase
      const { data, error } = await supabase
        .from('suppliers')
        .insert([{
          supplier_name: newSupplier.supplierName.trim(),
          balance_amount: 0,
          crate_balance: 0
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Map the returned data
      if (data && data[0]) {
        const newSupplierData: Supplier = {
          supplierId: data[0].supplier_id,
          supplierName: data[0].supplier_name,
          balanceAmount: data[0].balance_amount,
          crateBalance: data[0].crate_balance
        };
        
        setSuppliersData([...suppliersData, newSupplierData]);
        setNewSupplier({ supplierName: '' });
        setAddDialogOpen(false);
        
        toast({
          title: "Supplier Added",
          description: `${newSupplierData.supplierName} has been added successfully`
        });
      }
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Could not add supplier. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleModifySupplier = async () => {
    if (!supplierToModify) return;
    
    setIsSubmitting(true);
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('suppliers')
        .update({ 
          supplier_name: supplierToModify.supplierName 
        })
        .eq('supplier_id', supplierToModify.supplierId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      const updatedSuppliers = suppliersData.map(supplier => 
        supplier.supplierId === supplierToModify.supplierId ? supplierToModify : supplier
      );
      
      setSuppliersData(updatedSuppliers);
      setModifyDialogOpen(false);
      
      toast({
        title: "Supplier Updated",
        description: `${supplierToModify.supplierName} has been updated successfully`
      });
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Error",
        description: "Could not update supplier. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteSuppliers = async () => {
    if (selectedSuppliers.length === 0) {
      toast({
        title: "No Selection",
        description: "Please select at least one supplier to delete",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .in('supplier_id', selectedSuppliers);
        
      if (error) {
        throw error;
      }
      
      // Update local state
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
    } catch (error) {
      console.error('Error deleting suppliers:', error);
      toast({
        title: "Error",
        description: "Could not delete suppliers. They may have related transactions or purchases.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleAddTransaction = async () => {
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
    
    setIsSubmitting(true);
    try {
      // Insert transaction into Supabase
      const { data, error } = await supabase
        .from('supplier_transactions')
        .insert([{
          supplier_id: newTransaction.supplierId,
          date: newTransaction.date,
          opening_amount: newTransaction.openingAmount || 0,
          bill_amount: newTransaction.billAmount || 0,
          paid: newTransaction.paid || 0,
          damage: newTransaction.damage || 0,
          balance: balance,
          crate_opening: newTransaction.crateOpening || 0,
          crate_supply: newTransaction.crateSupply || 0,
          crate_return: newTransaction.crateReturn || 0,
          crate_balance: crateBalance
        }])
        .select();
        
      if (error) {
        throw error;
      }
      
      // Update supplier balance in Supabase
      const { error: supplierError } = await supabase
        .from('suppliers')
        .update({ 
          balance_amount: balance,
          crate_balance: crateBalance 
        })
        .eq('supplier_id', newTransaction.supplierId);
        
      if (supplierError) {
        throw supplierError;
      }
      
      // Map the returned data and update local state
      if (data && data[0]) {
        const newTransactionData: SupplierTransaction = {
          transactionId: data[0].transaction_id,
          supplierId: data[0].supplier_id,
          supplierName: selectedSupplierData.supplierName,
          date: data[0].date,
          openingAmount: data[0].opening_amount,
          billAmount: data[0].bill_amount,
          paid: data[0].paid,
          damage: data[0].damage,
          balance: data[0].balance,
          crateOpening: data[0].crate_opening,
          crateSupply: data[0].crate_supply,
          crateReturn: data[0].crate_return,
          crateBalance: data[0].crate_balance
        };
        
        setTransactions([newTransactionData, ...transactions]);
        
        // Update supplier balance in local state
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
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Could not add transaction. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
  
  // Columns definitions
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
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading suppliers...</span>
        </div>
      ) : (
        <DataTable 
          data={suppliersData} 
          columns={supplierDetailsColumns}
        />
      )}
      
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
            <Button onClick={handleAddSupplier} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Add Supplier
            </Button>
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
            <Button onClick={handleModifySupplier} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
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
            <Button variant="destructive" onClick={handleDeleteSuppliers} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Delete
            </Button>
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
            setSelectedDate(null);
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
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading transactions...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <DataTable 
                data={filteredTransactions}
                columns={transactionColumns}
                emptyMessage="No transactions found for the selected filters"
              />
            </div>
          )}
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
            <Button 
              onClick={handleAddTransaction} 
              disabled={!newTransaction.supplierId || isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Server className="h-4 w-4 mr-2" />}
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
