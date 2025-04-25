
import React, { ReactNode } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsContainerProps {
  tabs: Tab[];
  defaultValue?: string;
}

const TabsContainer: React.FC<TabsContainerProps> = ({ 
  tabs, 
  defaultValue = tabs[0]?.value 
}) => {
  return (
    <Tabs defaultValue={defaultValue} className="w-full">
      <TabsList className="mb-4">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default TabsContainer;
