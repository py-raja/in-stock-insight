
import React, { useState } from 'react';
import { Search, UserPlus, Save, Trash, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import DataTable from '@/components/common/DataTable';
import PageHeader from '@/components/common/PageHeader';
import { customers, Customer, getNextCustomerId } from '@/services/mockData';

const Customer = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [customerData, setCustomerData] = useState([...customers]);
  const [selectedCustomers, setSelectedCustomers] = useState<number[]>([]);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  
  // New customer state
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    customerAddress: '',
    customerMobile: '',
  });
  
  // Filter customers based on search term
  const filteredCustomers = customerData.filter(customer =>
    customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customerMobile.includes(searchTerm)
  );
  
  const handleSelectCustomer = (customerId: number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCustomers([...selectedCustomers, customerId]);
    } else {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
    }
  };
  
  const handleDeleteSelected = () => {
    setCustomerData(customerData.filter(cust => !selectedCustomers.includes(cust.customerId)));
    toast({
      title: "Customers Deleted",
      description: `${selectedCustomers.length} customers have been deleted`
    });
    setSelectedCustomers([]);
  };
  
  const handleInputChange = (field: keyof typeof newCustomer, value: string) => {
    setNewCustomer({
      ...newCustomer,
      [field]: value
    });
  };
  
  const handleEditInputChange = (field: keyof Customer, value: string | number) => {
    if (editCustomer) {
      setEditCustomer({
        ...editCustomer,
        [field]: value
      });
    }
  };
  
  const addNewCustomer = () => {
    // Validate fields
    if (!newCustomer.customerName || !newCustomer.customerMobile) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Create new customer with next available ID
    const customerToAdd: Customer = {
      customerId: getNextCustomerId(),
      ...newCustomer,
      amountBalance: 0,
      totalSales: 0,
      amountReceived: 0,
      profit: 0
    };
    
    // Add to customer list
    setCustomerData([...customerData, customerToAdd]);
    
    // Reset form
    setNewCustomer({
      customerName: '',
      customerAddress: '',
      customerMobile: '',
    });
    
    toast({
      title: "Customer Added",
      description: `${customerToAdd.customerName} has been added successfully`
    });
  };
  
  const saveCustomerChanges = () => {
    if (!editCustomer) return;
    
    // Validate fields
    if (!editCustomer.customerName || !editCustomer.customerMobile) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Update customer list
    setCustomerData(customerData.map(cust => 
      cust.customerId === editCustomer.customerId ? editCustomer : cust
    ));
    
    // Reset edit state
    setEditCustomer(null);
    
    toast({
      title: "Customer Updated",
      description: `${editCustomer.customerName} has been updated successfully`
    });
  };
  
  const cancelEdit = () => {
    setEditCustomer(null);
  };
  
  const columns = [
    { 
      header: '',
      accessorKey: (row: Customer) => (
        <Checkbox
          checked={selectedCustomers.includes(row.customerId)}
          onCheckedChange={(checked) => handleSelectCustomer(row.customerId, !!checked)}
        />
      )
    },
    { header: 'ID', accessorKey: 'customerId' },
    { 
      header: 'Customer Name', 
      accessorKey: editCustomer && editCustomer.customerId === ((customer: Customer) => customer.customerId)
        ? (customer: Customer) => (
            <Input
              value={editCustomer.customerName}
              onChange={(e) => handleEditInputChange('customerName', e.target.value)}
              className="min-w-[200px]"
            />
          )
        : 'customerName'
    },
    { 
      header: 'Address', 
      accessorKey: editCustomer && editCustomer.customerId === ((customer: Customer) => customer.customerId)
        ? (customer: Customer) => (
            <Input
              value={editCustomer.customerAddress}
              onChange={(e) => handleEditInputChange('customerAddress', e.target.value)}
              className="min-w-[200px]"
            />
          )
        : 'customerAddress'
    },
    { 
      header: 'Mobile', 
      accessorKey: editCustomer && editCustomer.customerId === ((customer: Customer) => customer.customerId)
        ? (customer: Customer) => (
            <Input
              value={editCustomer.customerMobile}
              onChange={(e) => handleEditInputChange('customerMobile', e.target.value)}
              className="min-w-[120px]"
            />
          )
        : 'customerMobile'
    },
    { 
      header: 'Balance', 
      accessorKey: (customer: Customer) => `₹${customer.amountBalance.toLocaleString()}`
    },
    {
      header: 'Actions',
      accessorKey: (customer: Customer) => {
        if (editCustomer && editCustomer.customerId === customer.customerId) {
          return (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={saveCustomerChanges} className="text-green-600">
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={cancelEdit} className="text-red-600">
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }
        
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditCustomer({ ...customer })}
            >
              Edit
            </Button>
          </div>
        );
      }
    }
  ];
  
  return (
    <div>
      <PageHeader 
        title="Customer Management" 
        subtitle="Manage customer profiles and transaction history"
        actions={
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" /> Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Enter the details of the new customer.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Customer Name *</label>
                    <Input
                      placeholder="Enter name"
                      value={newCustomer.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      placeholder="Enter address"
                      value={newCustomer.customerAddress}
                      onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mobile Number *</label>
                    <Input
                      placeholder="Enter mobile number"
                      value={newCustomer.customerMobile}
                      onChange={(e) => handleInputChange('customerMobile', e.target.value)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button onClick={addNewCustomer}>Add Customer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={selectedCustomers.length === 0}
                >
                  <Trash className="h-4 w-4 mr-2" /> Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete {selectedCustomers.length} selected customers?
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteSelected}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        }
      />
      
      <Card>
        <CardContent className="pt-6">
          <div className="flex mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <DataTable
            data={filteredCustomers}
            columns={columns}
            emptyMessage="No customers found"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Customer;
