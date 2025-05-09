
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import PurchaseDetails from '@/components/purchase/PurchaseDetails';
import AddNewPurchase from '@/components/purchase/AddNewPurchase';
import ModifyPurchase from '@/components/purchase/ModifyPurchase';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Purchase = () => {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Fetch purchases from Supabase
  useEffect(() => {
    async function fetchPurchases() {
      setIsLoading(true);
      try {
        // First, get all purchases with their supplier info
        const { data: purchasesData, error: purchasesError } = await supabase
          .from('purchases')
          .select(`
            purchase_id,
            supplier_id,
            purchase_date,
            total_amount,
            suppliers (supplier_name)
          `)
          .order('purchase_date', { ascending: false });
        
        if (purchasesError) {
          throw purchasesError;
        }
        
        // Now get all purchase items for each purchase
        const purchasesWithItems = await Promise.all(purchasesData.map(async (purchase) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('purchase_items')
            .select('*')
            .eq('purchase_id', purchase.purchase_id);
            
          if (itemsError) {
            throw itemsError;
          }
          
          // Format the data to match our frontend model
          return {
            purchaseId: purchase.purchase_id,
            supplierId: purchase.supplier_id,
            supplierName: purchase.suppliers.supplier_name,
            purchaseDate: purchase.purchase_date,
            totalAmount: purchase.total_amount,
            products: itemsData.map(item => ({
              productId: item.product_id,
              productName: item.product_name,
              quantity: item.quantity,
              purchasePrice: item.purchase_price,
            }))
          };
        }));
        
        setPurchases(purchasesWithItems);
      } catch (error) {
        console.error('Error fetching purchases:', error);
        toast({
          title: "Error",
          description: "Failed to load purchase data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPurchases();
  }, [toast]);
  
  // Function to handle adding a new purchase
  const handleAddPurchase = async (newPurchase: any) => {
    try {
      // First insert the purchase record
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          supplier_id: newPurchase.supplierId,
          purchase_date: newPurchase.purchaseDate,
          total_amount: newPurchase.totalAmount
        })
        .select();
        
      if (purchaseError) {
        throw purchaseError;
      }
      
      if (!purchaseData || purchaseData.length === 0) {
        throw new Error('No purchase data returned');
      }
      
      const purchaseId = purchaseData[0].purchase_id;
      
      // Then insert all purchase items
      const purchaseItems = newPurchase.products.map((product: any) => ({
        purchase_id: purchaseId,
        product_id: product.productId,
        product_name: product.productName,
        quantity: product.quantity,
        purchase_price: product.purchasePrice
      }));
      
      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);
        
      if (itemsError) {
        throw itemsError;
      }
      
      // Add the new purchase to state
      setPurchases([{
        ...newPurchase,
        purchaseId
      }, ...purchases]);
      
      toast({
        title: "Purchase Added",
        description: `Purchase #${purchaseId} has been added successfully`
      });
      
      // Switch to details tab
      setActiveTab('details');
    } catch (error) {
      console.error('Error adding purchase:', error);
      toast({
        title: "Error",
        description: "Failed to add purchase",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle modifying a purchase
  const handleModifyPurchase = async (modifiedPurchase: any) => {
    try {
      // Update the purchase record
      const { error: purchaseError } = await supabase
        .from('purchases')
        .update({
          purchase_date: modifiedPurchase.purchaseDate,
          total_amount: modifiedPurchase.totalAmount
        })
        .eq('purchase_id', modifiedPurchase.purchaseId);
        
      if (purchaseError) {
        throw purchaseError;
      }
      
      // Delete existing purchase items
      const { error: deleteError } = await supabase
        .from('purchase_items')
        .delete()
        .eq('purchase_id', modifiedPurchase.purchaseId);
        
      if (deleteError) {
        throw deleteError;
      }
      
      // Insert updated purchase items
      const purchaseItems = modifiedPurchase.products.map((product: any) => ({
        purchase_id: modifiedPurchase.purchaseId,
        product_id: product.productId,
        product_name: product.productName,
        quantity: product.quantity,
        purchase_price: product.purchasePrice
      }));
      
      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(purchaseItems);
        
      if (itemsError) {
        throw itemsError;
      }
      
      // Update the purchase in state
      setPurchases(purchases.map(purchase => 
        purchase.purchaseId === modifiedPurchase.purchaseId ? modifiedPurchase : purchase
      ));
      
      toast({
        title: "Purchase Updated",
        description: `Purchase #${modifiedPurchase.purchaseId} has been updated successfully`
      });
      
      // Switch to details tab
      setActiveTab('details');
    } catch (error) {
      console.error('Error modifying purchase:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle deleting a purchase
  const handleDeletePurchase = async (purchaseId: number) => {
    try {
      // Delete the purchase (cascade will delete purchase items)
      const { error } = await supabase
        .from('purchases')
        .delete()
        .eq('purchase_id', purchaseId);
        
      if (error) {
        throw error;
      }
      
      // Update the state
      setPurchases(purchases.filter(purchase => Number(purchase.purchaseId) !== purchaseId));
      
      toast({
        title: "Purchase Deleted",
        description: `Purchase #${purchaseId} has been deleted successfully`
      });
      
      // Switch to details tab
      setActiveTab('details');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      toast({
        title: "Error",
        description: "Failed to delete purchase",
        variant: "destructive"
      });
    }
  };
  
  // Function to handle viewing a purchase (selects it and changes tab)
  const handleViewPurchase = (purchaseId: number) => {
    setSelectedPurchaseId(purchaseId);
    setActiveTab('modify');
  };
  
  return (
    <div>
      <PageHeader 
        title="Purchase Management" 
        subtitle="Record and manage product purchases"
      />
      
      <Card>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Purchase Details</TabsTrigger>
            <TabsTrigger value="add">Add New</TabsTrigger>
            <TabsTrigger value="modify">Modify</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading purchases...</span>
            </div>
          ) : (
            <>
              <TabsContent value="details">
                <PurchaseDetails 
                  purchases={purchases}
                  onViewPurchase={handleViewPurchase}
                />
              </TabsContent>
              
              <TabsContent value="add">
                <AddNewPurchase onAddPurchase={handleAddPurchase} />
              </TabsContent>
              
              <TabsContent value="modify">
                <ModifyPurchase 
                  purchases={purchases}
                  onModifyPurchase={handleModifyPurchase}
                  onDeletePurchase={handleDeletePurchase}
                  selectedPurchaseId={selectedPurchaseId}
                />
              </TabsContent>
            </>
          )}
        </Tabs>
      </Card>
    </div>
  );
};

export default Purchase;
