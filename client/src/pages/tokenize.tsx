import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { WizardSteps } from "@/components/tokenize/wizard-steps";
import { storeFile, storeMetadata } from "@/lib/ipfs";
import { createAssetToken } from "@/lib/blockchain";
import { AssetType, Blockchain } from "@shared/schema";

// Define steps for the tokenization wizard
const STEPS = ["Asset Selection", "Asset Details", "Compliance", "Deploy"];

const Tokenize = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [assetData, setAssetData] = useState({
    name: "",
    userId: 1, // Using the demo user ID
    type: AssetType.REAL_ESTATE,
    subtype: "",
    description: "",
    location: "",
    company: "",
    value: 0,
    tokenized: 0,
    tokenizedValue: 0,
    liquidity: "medium",
    blockchain: Blockchain.POLYGON,
    status: "draft",
    ipfsHash: null,
    contractAddress: null,
    metadata: {}
  });

  const [complianceData, setComplianceData] = useState({
    jurisdiction: "US",
    kycRequired: true,
    kycCompleted: false,
    templateUsed: "",
    regulatoryNotes: "",
    complianceScore: 0
  });

  const [files, setFiles] = useState<File[]>([]);

  // Mutation for creating a new asset
  const createAssetMutation = useMutation({
    mutationFn: async (asset: any) => {
      const response = await apiRequest("POST", "/api/assets", asset);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      toast({
        title: "Asset Created",
        description: "Your asset has been successfully tokenized.",
      });
      
      // Create compliance record for the asset
      createComplianceMutation.mutate({
        ...complianceData,
        assetId: data.id
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create asset: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for creating a compliance record
  const createComplianceMutation = useMutation({
    mutationFn: async (compliance: any) => {
      const response = await apiRequest("POST", "/api/compliance", compliance);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
    },
    onError: (error) => {
      toast({
        title: "Warning",
        description: `Compliance record creation failed: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAssetTypeSelect = (type: string) => {
    setAssetData({
      ...assetData,
      type: type as AssetType,
      subtype: "" // Reset subtype when type changes
    });
  };

  const handleAssetSubtypeSelect = (subtype: string) => {
    setAssetData({
      ...assetData,
      subtype
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes("compliance.")) {
      const complianceField = name.split(".")[1];
      setComplianceData({
        ...complianceData,
        [complianceField]: value
      });
    } else {
      // Handle numeric values
      if (name === "value" || name === "tokenized") {
        const numValue = parseFloat(value) || 0;
        
        if (name === "value") {
          const tokenizedValue = (assetData.tokenized / 100) * numValue;
          setAssetData({
            ...assetData,
            [name]: numValue,
            tokenizedValue
          });
        } else if (name === "tokenized") {
          const tokenizedValue = (numValue / 100) * assetData.value;
          setAssetData({
            ...assetData,
            [name]: numValue,
            tokenizedValue
          });
        }
      } else {
        setAssetData({
          ...assetData,
          [name]: value
        });
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async () => {
    try {
      // Show loading toast
      toast({
        title: "Processing",
        description: "Uploading files to IPFS...",
      });
      
      // 1. Upload files to IPFS if any
      let ipfsHash = null;
      if (files.length > 0) {
        ipfsHash = await storeFile(files[0]);
      }
      
      // 2. Create asset metadata and upload to IPFS
      const metadata = {
        ...assetData.metadata,
        description: assetData.description,
        createdAt: new Date().toISOString()
      };
      const metadataHash = await storeMetadata(metadata);
      
      // 3. Create token on blockchain
      const { contractAddress } = await createAssetToken(
        assetData.blockchain,
        assetData.name,
        `TOK${assetData.name.slice(0, 3).toUpperCase()}`,
        Math.floor(assetData.value)
      );
      
      // 4. Create asset record
      const finalAssetData = {
        ...assetData,
        ipfsHash: ipfsHash || metadataHash,
        contractAddress,
        status: "active",
        metadata
      };
      
      createAssetMutation.mutate(finalAssetData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to tokenize asset: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tokenize New Asset</h1>
        <p className="text-gray-500 dark:text-gray-400">Create a tokenized representation of your real-world asset</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        {/* Tokenization Wizard */}
        <WizardSteps
          steps={STEPS}
          currentStep={currentStep}
          assetData={assetData}
          complianceData={complianceData}
          onAssetTypeSelect={handleAssetTypeSelect}
          onAssetSubtypeSelect={handleAssetSubtypeSelect}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSubmit}
          isSubmitting={createAssetMutation.isPending}
        />
      </div>
    </div>
  );
};

export default Tokenize;
