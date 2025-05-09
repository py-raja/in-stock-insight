
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageHeader from '@/components/common/PageHeader';
import PurchaseDetails from '@/components/purchase/PurchaseDetails';
import AddNewPurchase from '@/components/purchase/AddNewPurchase';
import ModifyPurchase from '@/components/purchase/ModifyPurchase';
import { getPurchasesFromDetails } from '@/services/mockData';

const Purchase = () => {
  const [purchases, setPurchases] = useState(getPurchasesFromDetails());
  const [activeTab, setActiveTab] = useState('details');
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<number | null>(null);
  
  // Function to handle adding a new purchase
  // SQL equivalent: INSERT INTO purchases (supplier_id, purchase_date, total_amount) VALUES ($1, $2, $3) RETURNING id;
  // Then for each product: INSERT INTO purchase_items (purchase_id, product_id, quantity, purchase_price) VALUES ($1, $2, $3, $4);
  const handleAddPurchase = (newPurchase: any) => {
    setPurchases([newPurchase, ...purchases]);
  };
  
  // Function to handle modifying a purchase
  // SQL equivalent: UPDATE purchases SET supplier_id=$1, purchase_date=$2, total_amount=$3 WHERE id=$4;
  // Then DELETE FROM purchase_items WHERE purchase_id=$1;
  // Then for each product: INSERT INTO purchase_items (purchase_id, product_id, quantity, purchase_price) VALUES ($1, $2, $3, $4);
  const handleModifyPurchase = (modifiedPurchase: any) => {
    setPurchases(purchases.map(purchase => 
      purchase.purchaseId === modifiedPurchase.purchaseId ? modifiedPurchase : purchase
    ));
  };
  
  // Function to handle deleting a purchase
  // SQL equivalent: DELETE FROM purchase_items WHERE purchase_id=$1; DELETE FROM purchases WHERE id=$1;
  const handleDeletePurchase = (purchaseId: number) => {
    setPurchases(purchases.filter(purchase => Number(purchase.purchaseId) !== purchaseId));
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
        </Tabs>
      </Card>
    </div>
  );
};

export default Purchase;
