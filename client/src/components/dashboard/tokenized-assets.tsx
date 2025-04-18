import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  formatCurrency, 
  getAssetTypeIcon, 
  getBlockchainIcon,
  getStatusBadgeStyle,
  getLiquidityBadgeStyle
} from "@/lib/utils";
import { Asset } from "@shared/schema";

interface TokenizedAssetsProps {
  assets: Asset[];
  loading?: boolean;
}

const TokenizedAssets = ({ assets, loading = false }: TokenizedAssetsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  // Filter assets based on search term
  const filteredAssets = assets.filter(asset => 
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (asset.location && asset.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (asset.company && asset.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = filteredAssets.slice(startIndex, startIndex + itemsPerPage);

  // Handle search change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };

  return (
    <Card className="mb-6">
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-medium">Tokenized Assets</h3>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">search</span>
            <Input
              type="text"
              placeholder="Search assets"
              className="pl-10 w-40 md:w-64"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <Button variant="outline" size="icon">
            <span className="material-icons text-sm">filter_list</span>
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800/50">
              <TableHead className="font-medium">Asset Name</TableHead>
              <TableHead className="font-medium">Type</TableHead>
              <TableHead className="font-medium">Value</TableHead>
              <TableHead className="font-medium">Tokenized</TableHead>
              <TableHead className="font-medium">Liquidity</TableHead>
              <TableHead className="font-medium">Chain</TableHead>
              <TableHead className="font-medium">Status</TableHead>
              <TableHead className="font-medium"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Loading state
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <TableCell>
                    <div className="flex items-center">
                      <Skeleton className="w-10 h-10 rounded-md mr-3" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-8" /></TableCell>
                </TableRow>
              ))
            ) : paginatedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <span className="material-icons text-4xl text-gray-400 mb-2">search_off</span>
                  <p className="text-gray-500 dark:text-gray-400">No assets found matching your search</p>
                </TableCell>
              </TableRow>
            ) : (
              // Render assets
              paginatedAssets.map((asset) => {
                const statusStyle = getStatusBadgeStyle(asset.status);
                const liquidityStyle = getLiquidityBadgeStyle(asset.liquidity);
                
                return (
                  <TableRow key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center mr-3">
                          <span className="material-icons text-primary">{getAssetTypeIcon(asset.type)}</span>
                        </div>
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.location || asset.company || ""}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {asset.type.replace('_', ' ').charAt(0).toUpperCase() + asset.type.replace('_', ' ').slice(1)}
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(asset.value)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="h-2 w-24 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${asset.tokenized}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm">{asset.tokenized}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 bg-${liquidityStyle.bg} ${liquidityStyle.text} text-xs rounded-full`}>
                        {asset.liquidity.charAt(0).toUpperCase() + asset.liquidity.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <img 
                          src={getBlockchainIcon(asset.blockchain)} 
                          className="w-4 h-4 mr-1" 
                          alt={asset.blockchain} 
                        />
                        <span className="capitalize">{asset.blockchain}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 ${statusStyle.bg} ${statusStyle.text} text-xs rounded-full`}>
                        {asset.status.replace('_', ' ').charAt(0).toUpperCase() + asset.status.replace('_', ' ').slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/assets/${asset.id}`}>
                        <Button variant="ghost" size="icon">
                          <span className="material-icons">more_vert</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {Math.min(filteredAssets.length, itemsPerPage)} of {filteredAssets.length} assets
        </p>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          >
            <span className="material-icons text-sm">chevron_left</span>
          </Button>
          
          {Array.from({ length: Math.min(totalPages, 3) }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                className="w-8 h-8 p-0"
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            );
          })}
          
          <Button
            variant="outline"
            size="icon"
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          >
            <span className="material-icons text-sm">chevron_right</span>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TokenizedAssets;
