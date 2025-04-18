import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";

interface PortfolioSummaryProps {
  totalValue: number;
  tokenizedValue: number;
  assetCount: number;
  monthlyRevenue: number;
  loading: boolean;
}

const PortfolioSummary = ({
  totalValue,
  tokenizedValue,
  assetCount,
  monthlyRevenue,
  loading = false,
}: PortfolioSummaryProps) => {
  // Calculate percentages for display
  const tokenizedPercentage = totalValue > 0 ? (tokenizedValue / totalValue) * 100 : 0;
  
  // Mock trends (up/down) for demo purposes
  const totalValueTrend = { direction: 'up', percentage: 2.5 };
  const liquidityTrend = { direction: 'down', percentage: 1.2 };
  const revenueTrend = { direction: 'up', percentage: 4.3 };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {/* Total Assets Value */}
      <Card className="bg-card card-gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Total Assets Value</h3>
            <span className="material-icons text-primary">account_balance</span>
          </div>
          <div className="flex items-end">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
                <p className="ml-2 text-sm text-success flex items-center">
                  <span className="material-icons text-sm">arrow_upward</span>
                  {totalValueTrend.percentage}%
                </p>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Across {loading ? "..." : assetCount} tokenized assets
          </p>
        </CardContent>
      </Card>

      {/* Liquidity Available */}
      <Card className="bg-card card-gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Liquidity Available</h3>
            <span className="material-icons text-secondary">water_drop</span>
          </div>
          <div className="flex items-end">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold">{formatCurrency(tokenizedValue)}</p>
                <p className="ml-2 text-sm text-error flex items-center">
                  <span className="material-icons text-sm">arrow_downward</span>
                  {liquidityTrend.percentage}%
                </p>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Last updated 2 hours ago</p>
        </CardContent>
      </Card>

      {/* Monthly Revenue */}
      <Card className="bg-card card-gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Monthly Revenue</h3>
            <span className="material-icons text-success">payments</span>
          </div>
          <div className="flex items-end">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
                <p className="ml-2 text-sm text-success flex items-center">
                  <span className="material-icons text-sm">arrow_upward</span>
                  {revenueTrend.percentage}%
                </p>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">From rent, invoices, and fees</p>
        </CardContent>
      </Card>

      {/* Compliance Score */}
      <Card className="bg-card card-gradient">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 dark:text-gray-400 font-medium">Compliance Score</h3>
            <span className="material-icons text-warning">verified</span>
          </div>
          <div className="flex items-center">
            {loading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <>
                <p className="text-2xl font-bold">92/100</p>
                <div className="ml-auto flex items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-warning/10 text-warning">
                    <span className="material-icons text-sm">priority_high</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">2 actions required</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioSummary;
