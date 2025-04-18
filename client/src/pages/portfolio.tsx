import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Asset, Transaction } from "@shared/schema";
import { formatCurrency, calculateTotalValue, calculateTokenizedValue, groupAssetsByType } from "@/lib/utils";

const Portfolio = () => {
  const [timeRange, setTimeRange] = useState("1M");

  // Fetch user assets
  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Fetch user transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  // Calculate portfolio stats
  const totalValue = calculateTotalValue(assets);
  const tokenizedValue = calculateTokenizedValue(assets);
  const groupedAssets = groupAssetsByType(assets);

  // Generate performance data for the chart (mock data for demo)
  const generatePerformanceData = () => {
    const now = new Date();
    const data = [];
    const points = timeRange === "1W" ? 7 : timeRange === "1M" ? 30 : timeRange === "3M" ? 90 : 365;
    const baseValue = totalValue * 0.9;
    const variance = totalValue * 0.2;
    
    for (let i = points; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const fluctuation = Math.random() * variance - (variance / 2);
      const value = baseValue + fluctuation + (i * (totalValue * 0.02) / points);
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value)
      });
    }
    
    return data;
  };
  
  const performanceData = generatePerformanceData();

  // Generate asset distribution data
  const distributionData = [
    { name: "Real Estate", value: calculateTotalValue(groupedAssets.real_estate), fill: "#3f51b5" },
    { name: "Invoices", value: calculateTotalValue(groupedAssets.invoice), fill: "#7986cb" },
    { name: "Equipment", value: calculateTotalValue(groupedAssets.equipment), fill: "#ff9800" }
  ];

  // Generate revenue data (mock data for demo)
  const generateRevenueData = () => {
    const now = new Date();
    const data = [];
    const months = 12;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleString('default', { month: 'short' });
      
      // Simulate revenue pattern with seasonal variations
      const baseRevenue = 7000 + Math.random() * 3000;
      const seasonalFactor = 1 + Math.sin((date.getMonth() / 12) * Math.PI * 2) * 0.2;
      const value = Math.round(baseRevenue * seasonalFactor);
      
      data.push({
        month,
        revenue: value
      });
    }
    
    return data;
  };
  
  const revenueData = generateRevenueData();

  // Currency formatter for charts
  const currencyFormatter = (value: number) => formatCurrency(value);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Portfolio Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Detailed view of your asset portfolio and performance metrics
        </p>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Portfolio Value</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokenized Value</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(tokenizedValue)}</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tokenization Ratio</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">
                {totalValue > 0 ? Math.round((tokenizedValue / totalValue) * 100) : 0}%
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Asset Count</CardDescription>
          </CardHeader>
          <CardContent>
            {assetsLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-2xl font-bold">{assets.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Performance Chart */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Portfolio Performance</CardTitle>
            <div className="flex space-x-1">
              <Button 
                variant={timeRange === "1W" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeRange("1W")}
              >
                1W
              </Button>
              <Button 
                variant={timeRange === "1M" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeRange("1M")}
              >
                1M
              </Button>
              <Button 
                variant={timeRange === "3M" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeRange("3M")}
              >
                3M
              </Button>
              <Button 
                variant={timeRange === "1Y" ? "default" : "outline"} 
                size="sm"
                onClick={() => setTimeRange("1Y")}
              >
                1Y
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3f51b5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3f51b5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return d.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tickFormatter={currencyFormatter}
                  width={80}
                  tick={{ fontSize: 12 }}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip 
                  formatter={(value) => [currencyFormatter(value as number), "Value"]}
                  labelFormatter={(date) => {
                    const d = new Date(date as string);
                    return d.toLocaleDateString('en-US', { 
                      year: 'numeric',
                      month: 'short', 
                      day: 'numeric' 
                    });
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3f51b5" 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Asset Distribution and Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {assetsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Skeleton className="h-full w-full rounded-md" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distributionData}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={currencyFormatter} width={80} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [currencyFormatter(value as number), "Value"]} />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {distributionData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.fill }}
                  ></div>
                  <span className="text-sm">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={currencyFormatter} width={80} tick={{ fontSize: 12 }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip formatter={(value) => [currencyFormatter(value as number), "Revenue"]} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#4caf50" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Asset Details and Transaction History */}
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Asset Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="real_estate">
              <TabsList className="mb-4">
                <TabsTrigger value="real_estate">Real Estate</TabsTrigger>
                <TabsTrigger value="invoice">Invoices</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
              </TabsList>
              
              {Object.entries(groupedAssets).map(([type, typeAssets]) => (
                <TabsContent key={type} value={type} className="mt-0">
                  {assetsLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    ))
                  ) : typeAssets.length === 0 ? (
                    <div className="text-center py-8">
                      <span className="material-icons text-3xl text-gray-400 mb-2">inventory</span>
                      <p className="text-gray-500">No {type.replace('_', ' ')} assets found</p>
                    </div>
                  ) : (
                    typeAssets.map((asset) => (
                      <div key={asset.id} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">{asset.name}</h3>
                            <p className="text-sm text-gray-500">
                              {asset.location || asset.company || ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(asset.value)}</p>
                            <p className="text-sm text-gray-500">
                              {asset.tokenized}% Tokenized
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Portfolio;
