import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Link } from "wouter";
import PortfolioSummary from "@/components/dashboard/portfolio-summary";
import AssetDistribution from "@/components/dashboard/asset-distribution";
import TokenizedAssets from "@/components/dashboard/tokenized-assets";
import ComplianceAlerts from "@/components/dashboard/compliance-alerts";
import QuickActions from "@/components/dashboard/quick-actions";
import { Asset } from "@shared/schema";
import { calculateTotalValue, calculateTokenizedValue } from "@/lib/utils";

const Dashboard = () => {
  // Fetch assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Fetch regulatory updates
  const { data: regulatoryUpdates = [], isLoading: updatesLoading } = useQuery({
    queryKey: ["/api/regulatory-updates"],
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
  });

  // Calculate portfolio stats
  const totalValue = calculateTotalValue(assets);
  const tokenizedValue = calculateTokenizedValue(assets);
  const assetCount = assets.length;
  const monthlyRevenue = 8420; // For demo purposes

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Overview of your tokenized assets and portfolio performance
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Link href="/tokenize">
            <button className="px-4 py-2 bg-primary text-white rounded-lg flex items-center hover:bg-primary/90">
              <span className="material-icons text-sm mr-1">add</span>
              Tokenize New Asset
            </button>
          </Link>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800">
            <span className="material-icons text-sm mr-1">download</span>
            Export
          </button>
        </div>
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummary
        totalValue={totalValue}
        tokenizedValue={tokenizedValue}
        assetCount={assetCount}
        monthlyRevenue={monthlyRevenue}
        loading={assetsLoading}
      />

      {/* Asset Distribution and Performance Charts */}
      <AssetDistribution 
        assets={assets} 
        loading={assetsLoading} 
      />

      {/* Tokenized Assets Table */}
      <TokenizedAssets 
        assets={assets} 
        loading={assetsLoading} 
      />

      {/* Compliance Alerts and Marketplace Activity */}
      <ComplianceAlerts
        regulatoryUpdates={regulatoryUpdates}
        transactions={transactions}
        loading={{ updates: updatesLoading, transactions: transactionsLoading }}
      />

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;
