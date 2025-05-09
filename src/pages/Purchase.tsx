
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
  
  // Function to handle adding a new purchase
  const handleAddPurchase = (newPurchase: any) => {
    setPurchases([newPurchase, ...purchases]);
  };
  
  // Function to handle modifying a purchase
  const handleModifyPurchase = (modifiedPurchase: any) => {
    setPurchases(purchases.map(purchase => 
      purchase.purchaseId === modifiedPurchase.purchaseId ? modifiedPurchase : purchase
    ));
  };
  
  // Function to handle deleting a purchase
  const handleDeletePurchase = (purchaseId: number) => {
    setPurchases(purchases.filter(purchase => purchase.purchaseId !== purchaseId));
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
              onViewPurchase={(purchaseId) => {
                setActiveTab('modify');
              }}
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
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Purchase;
