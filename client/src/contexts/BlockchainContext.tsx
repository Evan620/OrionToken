import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  connectWallet as connectWalletApi, 
  isWalletConnected as checkWalletConnected,
  getCurrentNetwork as getNetwork
} from "@/lib/blockchain";

interface BlockchainContextType {
  currentNetwork: string;
  isWalletConnected: boolean;
  walletAddress: string;
  connectWallet: () => Promise<void>;
  switchNetwork: (network: string) => Promise<void>;
}

const BlockchainContext = createContext<BlockchainContextType>({
  currentNetwork: "polygon",
  isWalletConnected: false,
  walletAddress: "",
  connectWallet: async () => {},
  switchNetwork: async () => {},
});

export const useBlockchain = () => useContext(BlockchainContext);

interface BlockchainProviderProps {
  children: React.ReactNode;
}

export const BlockchainProvider: React.FC<BlockchainProviderProps> = ({ children }) => {
  const [currentNetwork, setCurrentNetwork] = useState<string>("polygon");
  const [isWalletConnected, setIsWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>("");

  // Initialize blockchain connection on component mount
  useEffect(() => {
    const initBlockchain = async () => {
      try {
        // Check if wallet is already connected
        const connected = await checkWalletConnected();
        setIsWalletConnected(connected);
        
        if (connected) {
          // Set wallet address if connected
          const address = await connectWalletApi();
          setWalletAddress(address);
          
          // Get current network
          const network = await getNetwork();
          setCurrentNetwork(network);
        }
      } catch (error) {
        console.error("Error initializing blockchain:", error);
      }
    };
    
    initBlockchain();
  }, []);

  // Connect wallet function
  const connectWallet = async () => {
    try {
      const address = await connectWalletApi();
      setWalletAddress(address);
      setIsWalletConnected(true);
      
      // Update current network after connecting
      const network = await getNetwork();
      setCurrentNetwork(network);
      
      return address;
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  };

  // Switch network function (simplified for MVP)
  const switchNetwork = async (network: string) => {
    try {
      // In a real app, this would request the wallet to switch networks
      // For MVP, we'll just update the state
      setCurrentNetwork(network);
    } catch (error) {
      console.error("Error switching network:", error);
      throw error;
    }
  };

  // Listen for network or account changes
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      
      const handleChainChange = () => {
        window.location.reload();
      };
      
      const handleAccountsChange = (accounts: string[]) => {
        if (accounts.length === 0) {
          setIsWalletConnected(false);
          setWalletAddress("");
        } else {
          setIsWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      };
      
      ethereum.on("chainChanged", handleChainChange);
      ethereum.on("accountsChanged", handleAccountsChange);
      
      return () => {
        ethereum.removeListener("chainChanged", handleChainChange);
        ethereum.removeListener("accountsChanged", handleAccountsChange);
      };
    }
  }, []);

  const value = {
    currentNetwork,
    isWalletConnected,
    walletAddress,
    connectWallet,
    switchNetwork,
  };

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  );
};
