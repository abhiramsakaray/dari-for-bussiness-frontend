import React, { useState } from 'react';
import { BentoLayout } from './BentoLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FeeCollectionDashboard } from './admin/FeeCollectionDashboard';
import { MerchantFeeReport } from './admin/MerchantFeeReport';

export function AdminFees() {
  return (
    <BentoLayout activePage="admin">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Fee Collection</h1>
          <p className="text-muted-foreground">
            Monitor and manage platform transaction fees
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="merchant-report">Merchant Report</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FeeCollectionDashboard />
          </TabsContent>

          <TabsContent value="merchant-report" className="space-y-6">
            <MerchantFeeReport />
          </TabsContent>
        </Tabs>
      </div>
    </BentoLayout>
  );
}
