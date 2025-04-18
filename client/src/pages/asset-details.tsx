import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { 
  formatCurrency, 
  formatPercentage, 
  getAssetTypeIcon, 
  getBlockchainIcon, 
  getStatusBadgeStyle, 
  getLiquidityBadgeStyle, 
  formatIpfsUri 
} from "@/lib/utils";
import { formatIpfsUri as formatIpfsLink } from "@/lib/ipfs";
import { Asset, Transaction, Compliance } from "@shared/schema";

const AssetDetails = () => {
  const [, params] = useRoute("/assets/:id");
  const assetId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch asset details
  const { data: asset, isLoading: assetLoading } = useQuery<Asset>({
    queryKey: [`/api/assets/${assetId}`],
    enabled: !!assetId,
  });

  // Fetch asset compliance
  const { data: compliance, isLoading: complianceLoading } = useQuery<Compliance>({
    queryKey: [`/api/assets/${assetId}/compliance`],
    enabled: !!assetId,
  });

  // Fetch asset transactions
  const { data: transactions = [], isLoading: transactionsLoading } = useQuery<Transaction[]>({
    queryKey: [`/api/assets/${assetId}/transactions`],
    enabled: !!assetId,
  });

  // Generate mock price history for the asset
  const generatePriceHistory = () => {
    if (!asset) return [];
    
    const basePrice = asset.value / (asset.tokenized / 100);
    const now = new Date();
    const data = [];
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Random fluctuation between -2% and +3%
      const fluctuation = (Math.random() * 0.05) - 0.02;
      const price = basePrice * (1 + fluctuation);
      
      data.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100
      });
    }
    
    return data;
  };
  
  const priceHistory = generatePriceHistory();

  // Format the date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (assetLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <Skeleton className="h-8 w-1/3 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center py-12">
          <span className="material-icons text-5xl text-gray-400 mb-4">warning</span>
          <h1 className="text-2xl font-bold mb-2">Asset Not Found</h1>
          <p className="text-gray-500 dark:text-gray-400">
            The asset you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  // Get badge styles for status and liquidity
  const statusStyle = getStatusBadgeStyle(asset.status);
  const liquidityStyle = getLiquidityBadgeStyle(asset.liquidity);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
              <span className="material-icons text-primary">
                {getAssetTypeIcon(asset.type)}
              </span>
            </div>
            <h1 className="text-2xl font-bold">{asset.name}</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {asset.location || asset.company || asset.description?.substring(0, 100)}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <div className={`px-3 py-1 rounded-full text-sm ${statusStyle.bg} ${statusStyle.text}`}>
            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1).replace('_', ' ')}
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
            <img 
              src={getBlockchainIcon(asset.blockchain)} 
              alt={asset.blockchain} 
              className="w-4 h-4 mr-2" 
            />
            <span className="text-sm font-medium capitalize">
              {asset.blockchain}
            </span>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Asset summary card */}
        <Card>
          <CardHeader>
            <CardTitle>Asset Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Asset Value</p>
              <p className="text-xl font-bold">{formatCurrency(asset.value)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Tokenized</p>
              <div className="flex items-center">
                <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mr-3">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${asset.tokenized}%` }}
                  ></div>
                </div>
                <span className="font-medium">{formatPercentage(asset.tokenized)}</span>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Tokenized Value</p>
              <p className="text-xl font-bold">{formatCurrency(asset.tokenizedValue)}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Liquidity</p>
              <div className={`px-3 py-1 rounded-full text-sm inline-block ${liquidityStyle.bg} ${liquidityStyle.text}`}>
                {asset.liquidity.charAt(0).toUpperCase() + asset.liquidity.slice(1)}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-1">Created On</p>
              <p className="font-medium">{formatDate(asset.createdAt)}</p>
            </div>
            
            {asset.contractAddress && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Smart Contract</p>
                <a 
                  href={`https://etherscan.io/address/${asset.contractAddress}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono text-sm break-all"
                >
                  {asset.contractAddress}
                </a>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <Button className="w-full">
                <span className="material-icons mr-2 text-sm">shopping_cart</span>
                Buy Tokens
              </Button>
              {asset.ipfsHash && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={formatIpfsLink(asset.ipfsHash)} target="_blank" rel="noopener noreferrer">
                    <span className="material-icons mr-2 text-sm">description</span>
                    View Documents
                  </a>
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>

        {/* Asset details tabs */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="compliance">Compliance</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <TabsContent value="overview" className="mt-0 space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {asset.description || "No description available for this asset."}
                </p>
              </div>
              
              {asset.metadata && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(asset.metadata).map(([key, value]) => (
                      <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
                        <p className="text-sm text-gray-500 mb-1 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="font-medium">{value?.toString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="performance" className="mt-0">
              <div className="h-64 mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceHistory}>
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(date) => {
                        const d = new Date(date);
                        return d.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });
                      }}
                    />
                    <YAxis 
                      tickFormatter={(value) => formatCurrency(value)}
                      width={80}
                      tick={{ fontSize: 12 }}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <Tooltip 
                      formatter={(value) => [formatCurrency(value as number), "Token Price"]}
                      labelFormatter={(date) => {
                        const d = new Date(date as string);
                        return d.toLocaleDateString('en-US', { 
                          year: 'numeric',
                          month: 'long', 
                          day: 'numeric' 
                        });
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3f51b5" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Transactions</h3>
                {transactionsLoading ? (
                  <Skeleton className="h-24 w-full" />
                ) : transactions.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No transactions recorded for this asset yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            tx.transactionType === 'sale' ? 'bg-green-100 text-green-600' : 
                            tx.transactionType === 'purchase' ? 'bg-blue-100 text-blue-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            <span className="material-icons text-sm">
                              {tx.transactionType === 'sale' ? 'call_made' : 
                               tx.transactionType === 'purchase' ? 'call_received' : 
                               'pending'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium capitalize">{tx.transactionType}</p>
                            <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(tx.valueAmount)}</p>
                          <p className="text-sm text-gray-500">{tx.tokenAmount} tokens</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="compliance" className="mt-0">
              {complianceLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : !compliance ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No compliance information available for this asset.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-4">
                        <span className="material-icons text-2xl text-gray-500">verified</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Compliance Score</h3>
                        <p className="text-sm text-gray-500">Based on regulatory requirements</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {compliance.complianceScore}/100
                      </div>
                      <div className={`text-sm ${
                        compliance.complianceScore >= 80 ? 'text-green-500' : 
                        compliance.complianceScore >= 60 ? 'text-yellow-500' : 
                        'text-red-500'
                      }`}>
                        {compliance.complianceScore >= 80 ? 'Good' : 
                         compliance.complianceScore >= 60 ? 'Needs Attention' : 
                         'Action Required'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-medium mb-2">Jurisdiction</h3>
                      <p>{compliance.jurisdiction}</p>
                    </div>
                    
                    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <h3 className="font-medium mb-2">KYC Status</h3>
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                          compliance.kycCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          <span className="material-icons text-sm">
                            {compliance.kycCompleted ? 'check' : 'pending'}
                          </span>
                        </div>
                        <p>{compliance.kycCompleted ? 'Completed' : 'Pending'}</p>
                      </div>
                    </div>
                    
                    {compliance.templateUsed && (
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-medium mb-2">Legal Template</h3>
                        <p>{compliance.templateUsed}</p>
                      </div>
                    )}
                    
                    {compliance.regulatoryNotes && (
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg md:col-span-2">
                        <h3 className="font-medium mb-2">Regulatory Notes</h3>
                        <p className="text-gray-700 dark:text-gray-300">{compliance.regulatoryNotes}</p>
                      </div>
                    )}
                  </div>
                  
                  {compliance.complianceScore < 80 && (
                    <div className="p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900 rounded-lg">
                      <div className="flex items-start">
                        <span className="material-icons text-yellow-500 mr-2">warning</span>
                        <div>
                          <h3 className="font-medium mb-1">Action Required</h3>
                          <p className="text-sm">
                            Your compliance score is below the recommended threshold. 
                            Please review the regulatory requirements and update your documentation.
                          </p>
                          <Button className="mt-2" variant="outline" size="sm">
                            Fix Compliance Issues
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="documents" className="mt-0">
              {!asset.ipfsHash ? (
                <div className="text-center py-8">
                  <span className="material-icons text-4xl text-gray-400 mb-2">description</span>
                  <h3 className="font-medium mb-2">No Documents Uploaded</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Upload asset documentation to enhance trust and provide compliance evidence.
                  </p>
                  <Button>
                    <span className="material-icons text-sm mr-2">upload_file</span>
                    Upload Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center mr-3">
                          <span className="material-icons text-gray-500">description</span>
                        </div>
                        <div>
                          <h3 className="font-medium">Asset Documentation</h3>
                          <p className="text-sm text-gray-500">Uploaded to IPFS</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={formatIpfsLink(asset.ipfsHash)} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">IPFS Hash</h3>
                    <code className="block p-3 bg-gray-100 dark:bg-gray-800 rounded-md font-mono text-sm break-all">
                      {asset.ipfsHash}
                    </code>
                    <p className="text-sm text-gray-500 mt-2">
                      This is a permanent, decentralized record of your asset documentation.
                    </p>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium mb-3">Additional Documents</h3>
                    <Button>
                      <span className="material-icons text-sm mr-2">upload_file</span>
                      Upload More Documents
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AssetDetails;
