
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const AssetTypeList = () => {
  const [location] = useLocation();
  const assetType = location.split("/").pop() || "";
  
  const { data: assets = [], isLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
    select: (data) => data.filter(asset => 
      asset.type === assetType.replace("-", "_")
    ),
  });

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[200px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {assetType.split("-").map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(" ")} Assets
        </h2>
        <Button onClick={() => location = "/tokenize"}>
          Tokenize New Asset
        </Button>
      </div>

      {assets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <span className="material-icons text-4xl text-gray-400 mb-4">
              inventory_2
            </span>
            <h3 className="text-lg font-medium mb-2">No assets found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start by tokenizing your first {assetType.replace("-", " ")} asset
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => (
            <Card key={asset.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>{asset.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  Value: ${asset.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Tokenized: {asset.tokenized}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssetTypeList;
