
import React, { useState } from 'react';
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
import { getCompanyNames } from '@/services/mockData';
import { CalendarIcon, Search, FileText, Pencil } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

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
  
  // Company names for dropdown
  // SQL query equivalent: SELECT DISTINCT company_name FROM suppliers ORDER BY company_name
  const companyNames = getCompanyNames();
  
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Apply filters
    applyFilters(newFilters);
  };
  
  const applyFilters = (currentFilters: typeof filters) => {
    // SQL query equivalent:
    // SELECT p.purchase_id, s.supplier_name, p.purchase_date, 
    //        (SELECT string_agg(product_name, ', ') FROM purchase_items pi 
    //         JOIN products pr ON pi.product_id = pr.id
    //         WHERE pi.purchase_id = p.purchase_id) as products,
    //        p.total_amount
    // FROM purchases p
    // JOIN suppliers s ON p.supplier_id = s.id
    // WHERE 
    //   ($1 = '' OR p.purchase_id::text ILIKE '%' || $1 || '%') AND
    //   ($2 = 'all' OR s.supplier_name = $2) AND
    //   ($3 IS NULL OR p.purchase_date = $3) AND
    //   ($4 = '' OR EXISTS (SELECT 1 FROM purchase_items pi
    //                       JOIN products pr ON pi.product_id = pr.id 
    //                       WHERE pi.purchase_id = p.purchase_id 
    //                       AND pr.product_name ILIKE '%' || $4 || '%'))
    // ORDER BY p.purchase_date DESC;
    
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
              // The below would be handled in Production by:
              // 1. Setting the active tab to 'modify' via state management
              // 2. Pre-filling the modify form with the selected purchase data
              // SQL: SELECT * FROM purchases JOIN purchase_items ON purchases.id = purchase_items.purchase_id WHERE purchases.id = $1
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
