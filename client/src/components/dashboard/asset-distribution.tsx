import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { useMemo, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Asset } from "@shared/schema";

interface AssetDistributionProps {
  assets: Asset[];
  loading?: boolean;
}

const AssetDistribution = ({ assets, loading = false }: AssetDistributionProps) => {
  const [performanceRange, setPerformanceRange] = useState("1M");

  // Calculate asset type distribution
  const distributionData = useMemo(() => {
    if (!assets?.length) return [];

    const distribution = {
      real_estate: { name: "Real Estate", value: 0, color: "#3f51b5" },
      invoice: { name: "Invoices", value: 0, color: "#7986cb" },
      equipment: { name: "Equipment", value: 0, color: "#ff9800" },
    };

    assets.forEach((asset) => {
      if (distribution[asset.type as keyof typeof distribution]) {
        distribution[asset.type as keyof typeof distribution].value += asset.value || 0;
      }
    });

    return Object.values(distribution).filter((item) => item.value > 0);
  }, [assets]);

  // Generate portfolio performance data based on selected time range
  const performanceData = useMemo(() => {
    // Mock data for demonstration
    const dataPoints = performanceRange === "1W" ? 7 : 
                       performanceRange === "1M" ? 30 : 
                       performanceRange === "3M" ? 12 : 12;
    
    const data = [];
    const now = new Date();
    const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    const volatility = totalValue * 0.15; // 15% volatility for demonstration
    
    let currentValue = totalValue * 0.95; // Start a bit lower than current
    
    for (let i = 0; i < dataPoints; i++) {
      const date = new Date(now);
      
      if (performanceRange === "1W") {
        date.setDate(date.getDate() - (dataPoints - i - 1));
      } else if (performanceRange === "1M") {
        date.setDate(date.getDate() - (dataPoints - i - 1));
      } else if (performanceRange === "3M") {
        date.setDate(date.getDate() - ((dataPoints - i - 1) * 7));
      } else {
        date.setMonth(date.getMonth() - (dataPoints - i - 1));
      }
      
      // Add some random movement with an upward trend
      const randomChange = (Math.random() - 0.3) * (volatility / dataPoints);
      currentValue += randomChange;
      
      // Ensure we end at the current total value
      if (i === dataPoints - 1) {
        currentValue = totalValue;
      }
      
      data.push({
        name: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.round(currentValue),
      });
    }
    
    return data;
  }, [assets, performanceRange]);
  
  // Calculate portfolio stats
  const portfolioStats = useMemo(() => {
    const values = performanceData.map(d => d.value);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      volatility: values.length > 1 ? 'Low' : 'N/A',
      highest: Math.max(...values),
      lowest: Math.min(...values)
    };
  }, [performanceData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Asset Class Distribution */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Asset Distribution</h3>
            <button className="text-gray-400 hover:text-gray-500">
              <span className="material-icons">more_horiz</span>
            </button>
          </div>
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Skeleton className="h-40 w-40 rounded-full" />
            </div>
          ) : distributionData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <span className="material-icons text-4xl text-gray-400 mb-2">pie_chart</span>
                <p className="text-gray-500">No assets to display</p>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-2 mt-4">
            {distributionData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {((item.value / distributionData.reduce((a, b) => a + b.value, 0)) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Performance */}
      <Card className="col-span-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Portfolio Performance</h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant={performanceRange === "1W" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPerformanceRange("1W")}
              >
                1W
              </Button>
              <Button 
                variant={performanceRange === "1M" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPerformanceRange("1M")}
              >
                1M
              </Button>
              <Button 
                variant={performanceRange === "3M" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPerformanceRange("3M")}
              >
                3M
              </Button>
              <Button 
                variant={performanceRange === "1Y" ? "default" : "outline"} 
                size="sm"
                onClick={() => setPerformanceRange("1Y")}
              >
                1Y
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="h-64">
              <Skeleton className="h-full w-full" />
            </div>
          ) : (
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                    width={85}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), "Value"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3f51b5" 
                    strokeWidth={2}
                    dot={{ r: 3, fill: "#3f51b5" }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          
          <div className="grid grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">30d Avg.</p>
              <p className="font-medium">
                {loading ? <Skeleton className="h-5 w-16" /> : <span>{formatCurrency(portfolioStats.avg)}</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Volatility</p>
              <p className="font-medium">
                {loading ? <Skeleton className="h-5 w-16" /> : <span>{portfolioStats.volatility}</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Highest</p>
              <p className="font-medium">
                {loading ? <Skeleton className="h-5 w-16" /> : <span>{formatCurrency(portfolioStats.highest)}</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Lowest</p>
              <p className="font-medium">
                {loading ? <Skeleton className="h-5 w-16" /> : <span>{formatCurrency(portfolioStats.lowest)}</span>}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetDistribution;
