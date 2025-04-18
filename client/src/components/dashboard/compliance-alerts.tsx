import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { RegulatoryUpdate, Transaction } from "@shared/schema";

interface ComplianceAlertsProps {
  regulatoryUpdates: RegulatoryUpdate[];
  transactions: Transaction[];
  loading: {
    updates: boolean;
    transactions: boolean;
  };
}

const ComplianceAlerts = ({ 
  regulatoryUpdates, 
  transactions, 
  loading
}: ComplianceAlertsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Regulatory Updates */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Regulatory Updates</CardTitle>
            <Button variant="ghost" size="icon">
              <span className="material-icons">refresh</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading.updates ? (
            // Loading state
            Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <div className="flex">
                  <Skeleton className="w-8 h-8 rounded-full mr-3" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-2" />
                    <Skeleton className="h-4 w-1/4 mt-2" />
                  </div>
                </div>
              </div>
            ))
          ) : regulatoryUpdates.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-gray-400 mb-2">article</span>
              <p className="text-gray-500">No regulatory updates to display</p>
            </div>
          ) : (
            // Render regulatory updates
            regulatoryUpdates.map((update) => (
              <div 
                key={update.id} 
                className={`flex items-start p-4 rounded-lg ${
                  update.severity === 'warning' 
                    ? 'bg-warning/5 border border-warning/20' 
                    : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                  update.severity === 'warning' 
                    ? 'bg-warning/10 text-warning' 
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  <span className="material-icons">
                    {update.severity === 'warning' ? 'notifications' : 'info'}
                  </span>
                </div>
                <div>
                  <h4 className={`font-medium ${
                    update.severity === 'warning' ? 'text-warning' : ''
                  }`}>
                    {update.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {update.description}
                  </p>
                  <div className="mt-2">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      {/* Marketplace Activity */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Marketplace Activity</CardTitle>
            <Button variant="outline" size="sm">View All</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading.transactions ? (
            // Loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-start">
                  <Skeleton className="w-10 h-10 rounded-full mr-3" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="text-right">
                  <Skeleton className="h-5 w-20 mb-1" />
                  <Skeleton className="h-4 w-16 ml-auto" />
                </div>
              </div>
            ))
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <span className="material-icons text-4xl text-gray-400 mb-2">swap_horiz</span>
              <p className="text-gray-500">No marketplace activity to display</p>
            </div>
          ) : (
            // Render transactions
            transactions.map((tx) => {
              // Determine transaction icon and color
              let iconName = 'pending';
              let iconColorClass = 'bg-warning/10 text-warning';
              
              if (tx.transactionType === 'sale') {
                iconName = 'call_made';
                iconColorClass = 'bg-success/10 text-success';
              } else if (tx.transactionType === 'purchase') {
                iconName = 'call_received';
                iconColorClass = 'bg-error/10 text-error';
              } else if (tx.transactionType === 'listing') {
                iconName = 'local_offer';
                iconColorClass = 'bg-success/10 text-success';
              }
              
              // Determine transaction price change indicator
              let priceChange = null;
              if (tx.transactionType === 'sale') {
                priceChange = <p className="text-sm text-success">+2.4%</p>;
              } else if (tx.transactionType === 'purchase') {
                priceChange = <p className="text-sm text-error">-0.8%</p>;
              } else if (tx.transactionType === 'offer') {
                priceChange = <p className="text-sm text-warning">Pending</p>;
              } else if (tx.transactionType === 'listing') {
                priceChange = <p className="text-sm text-gray-500 dark:text-gray-400">Just Listed</p>;
              }
              
              return (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-start">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${iconColorClass}`}>
                      <span className="material-icons">{iconName}</span>
                    </div>
                    <div>
                      <p className="font-medium capitalize">
                        {tx.transactionType === 'sale' ? 'Token Sale' :
                         tx.transactionType === 'purchase' ? 'Token Purchase' :
                         tx.transactionType === 'offer' ? 'Token Offer' :
                         'Token Listing'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Asset #{tx.assetId} • {tx.tokenAmount} tokens
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(tx.valueAmount)}</p>
                    {priceChange}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceAlerts;
