import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Asset } from "@shared/schema";
import { formatCurrency, getAssetTypeIcon, getBlockchainIcon } from "@/lib/utils";

const Marketplace = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 1000000]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch assets for marketplace
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  // Filter assets based on search, tab, and price range
  const filteredAssets = assets.filter(asset => {
    // Filter by tab (asset type)
    if (activeTab !== "all" && asset.type !== activeTab) {
      return false;
    }
    
    // Filter by price range
    if (asset.value < priceRange[0] || asset.value > priceRange[1]) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {/* Marketplace Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Marketplace</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Discover and invest in tokenized real-world assets
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/tokenize">
            <Button>
              <span className="material-icons text-sm mr-1">add</span>
              List New Asset
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">search</span>
              <Input
                type="text"
                placeholder="Search assets by name, location..."
                className="pl-10"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <label className="text-sm text-gray-500 dark:text-gray-400 mb-2">Price Range: {formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</label>
              <Slider
                defaultValue={[0, 1000000]}
                max={1000000}
                step={10000}
                value={priceRange}
                onValueChange={handlePriceRangeChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Content */}
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Assets</TabsTrigger>
          <TabsTrigger value="real_estate">Real Estate</TabsTrigger>
          <TabsTrigger value="invoice">Invoices</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-0">
                    <Skeleton className="h-48 w-full" />
                  </CardHeader>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-between">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-1/3" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredAssets.length === 0 ? (
              <div className="col-span-3 py-12 text-center">
                <span className="material-icons text-4xl text-gray-400 mb-4">search_off</span>
                <h3 className="text-lg font-medium mb-2">No assets found</h3>
                <p className="text-gray-500 dark:text-gray-400">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filteredAssets.map((asset) => (
                <Link key={asset.id} href={`/assets/${asset.id}`} className="block">
                    <Card className="overflow-hidden h-full hover:shadow-md transition-shadow">
                      <CardHeader className="p-0 relative" style={{ height: '180px' }}>
                        <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center">
                          <span className="material-icons text-5xl text-gray-600 dark:text-gray-400">
                            {getAssetTypeIcon(asset.type)}
                          </span>
                        </div>
                        <div className="absolute top-2 right-2">
                          <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-2 py-1 shadow-sm">
                            <span className="material-icons text-xs mr-1">
                              {asset.blockchain === 'ethereum' ? 'currency_bitcoin' : 
                               asset.blockchain === 'polygon' ? 'hexagon' : 'token'}
                            </span>
                            <span className="text-xs font-medium capitalize">
                              {asset.blockchain}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4">
                        <CardTitle className="mb-1 text-lg truncate">{asset.name}</CardTitle>
                        <CardDescription className="mb-4 h-10">
                          {asset.location || asset.company || ""}
                        </CardDescription>
                        <div className="flex justify-between text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Value</p>
                            <p className="font-medium"><span>{formatCurrency(asset.value)}</span></p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Tokenized</p>
                            <p className="font-medium"><span>{asset.tokenized}%</span></p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 border-t border-gray-100 dark:border-gray-700 mt-2">
                        <div className="w-full flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`px-2 py-1 rounded-full text-xs ${
                              asset.liquidity === 'high' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : asset.liquidity === 'medium'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {asset.liquidity.charAt(0).toUpperCase() + asset.liquidity.slice(1)} Liquidity
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Marketplace;
