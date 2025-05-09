
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import DataTable from '@/components/common/DataTable';
import { CalendarIcon, Search, FileText, Pencil } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

interface PurchaseDetailsProps {
  purchases: any[];
  onViewPurchase: (purchaseId: number) => void;
}

const PurchaseDetails = ({ purchases, onViewPurchase }: PurchaseDetailsProps) => {
  const [filteredPurchases, setFilteredPurchases] = useState(purchases);
  const [filters, setFilters] = useState({
    purchaseId: '',
    companyName: '',
    date: null as Date | null,
    productName: '',
  });
  
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  
  // Fetch company names from Supabase
  useEffect(() => {
    async function fetchCompanyNames() {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('supplier_name')
          .order('supplier_name');
        
        if (error) {
          throw error;
        }
        
        setCompanyNames(data.map(supplier => supplier.supplier_name));
      } catch (error) {
        console.error('Error fetching company names:', error);
      }
    }
    
    fetchCompanyNames();
  }, []);
  
  // Update filtered purchases when purchases prop changes
  useEffect(() => {
    setFilteredPurchases(purchases);
  }, [purchases]);
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters
    applyFilters(newFilters);
  };
  
  const applyFilters = (currentFilters: typeof filters) => {
    let filtered = [...purchases];
    
    if (currentFilters.purchaseId) {
      filtered = filtered.filter(purchase => 
        purchase.purchaseId.toString().includes(currentFilters.purchaseId)
      );
    }
    
    if (currentFilters.companyName && currentFilters.companyName !== 'all') {
      filtered = filtered.filter(purchase => 
        purchase.supplierName === currentFilters.companyName
      );
    }
    
    if (currentFilters.date) {
      const dateStr = format(currentFilters.date, 'yyyy-MM-dd');
      filtered = filtered.filter(purchase => purchase.purchaseDate === dateStr);
    }
    
    if (currentFilters.productName) {
      filtered = filtered.filter(purchase => 
        purchase.products.some((product: any) => 
          product.productName.toLowerCase().includes(currentFilters.productName.toLowerCase())
        )
      );
    }
    
    setFilteredPurchases(filtered);
  };
  
  const resetFilters = () => {
    setFilters({
      purchaseId: '',
      companyName: '',
      date: null,
      productName: '',
    });
    setFilteredPurchases(purchases);
  };
  
  // DataTable columns
  const columns = [
    { header: 'Purchase ID', accessorKey: 'purchaseId' },
    { header: 'Supplier', accessorKey: 'supplierName' },
    { header: 'Date', accessorKey: 'purchaseDate' },
    { 
      header: 'Products', 
      accessorKey: (row: any) => {
        const productList = row.products.map((p: any) => p.productName).join(', ');
        return productList.length > 30 ? `${productList.substring(0, 30)}...` : productList;
      }
    },
    { header: 'Total Amount', accessorKey: (row: any) => `₹${row.totalAmount.toLocaleString()}` },
    { 
      header: 'Actions', 
      accessorKey: (row: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onViewPurchase(Number(row.purchaseId))}
            className="flex items-center"
          >
            <FileText className="h-4 w-4 mr-1" />
            View
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              onViewPurchase(Number(row.purchaseId));
            }}
            className="flex items-center"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Modify
          </Button>
        </div>
      )
    }
  ];
  
  return (
    <CardContent className="pt-6">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium">Purchase ID</label>
            <div className="mt-1">
              <Input
                type="text"
                placeholder="Filter by ID"
                value={filters.purchaseId}
                onChange={(e) => handleFilterChange('purchaseId', e.target.value)}
              />
            </div>
          </div>
          
          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium">Company</label>
            <div className="mt-1">
              <Select
                value={filters.companyName}
                onValueChange={(value) => handleFilterChange('companyName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  {companyNames.map(company => (
                    <SelectItem key={company} value={company}>{company}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium">Date</label>
            <div className="mt-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.date ? format(filters.date, 'PPP') : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.date as Date}
                    onSelect={(date) => handleFilterChange('date', date)}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="w-full sm:w-[200px]">
            <label className="text-sm font-medium">Product</label>
            <div className="mt-1">
              <Input
                type="text"
                placeholder="Filter by product"
                value={filters.productName}
                onChange={(e) => handleFilterChange('productName', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-end space-x-2">
            <Button onClick={resetFilters} variant="outline">Reset</Button>
          </div>
        </div>
        
        <DataTable 
          data={filteredPurchases}
          columns={columns}
          emptyMessage="No purchases found"
        />
      </div>
    </CardContent>
  );
};

export default PurchaseDetails;
