import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/hooks/use-theme";
import { useBlockchain } from "@/contexts/BlockchainContext";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const { currentNetwork, connectWallet, isWalletConnected, walletAddress } = useBlockchain();
  const [searchQuery, setSearchQuery] = useState("");

  const handleThemeToggle = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleWalletConnect = async () => {
    try {
      await connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-4 md:hidden" 
            onClick={onMenuClick}
          >
            <span className="material-icons">menu</span>
          </Button>
          
          <form onSubmit={handleSearch} className="relative">
            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
            <Input
              type="text"
              placeholder="Search assets, markets..."
              className="pl-10 w-40 md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Chain Selector */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1 px-3">
            <img 
              src={
                currentNetwork === "ethereum" 
                  ? "https://cryptologos.cc/logos/ethereum-eth-logo.png"
                  : "https://cryptologos.cc/logos/polygon-matic-logo.png"
              } 
              className="w-5 h-5 mr-2" 
              alt={currentNetwork}
            />
            <span className="text-sm font-medium capitalize">{currentNetwork}</span>
            <span className="material-icons text-sm ml-1">expand_more</span>
          </div>
          
          {/* Wallet Connect Button (simplified) */}
          {!isWalletConnected ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex"
              onClick={handleWalletConnect}
            >
              <span className="material-icons text-sm mr-1">account_balance_wallet</span>
              Connect Wallet
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex"
            >
              <span className="material-icons text-sm mr-1">account_balance_wallet</span>
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </Button>
          )}
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <span className="material-icons">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          {/* Dark mode toggle */}
          <Button variant="ghost" size="icon" onClick={handleThemeToggle}>
            <span className={`material-icons ${theme === 'dark' ? 'hidden' : 'block'}`}>dark_mode</span>
            <span className={`material-icons ${theme === 'dark' ? 'block' : 'hidden'}`}>light_mode</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
