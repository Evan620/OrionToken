import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useBlockchain } from "@/contexts/BlockchainContext";
import { AssetType, Blockchain } from "@shared/schema";

interface WizardStepsProps {
  steps: string[];
  currentStep: number;
  assetData: any;
  complianceData: any;
  onAssetTypeSelect: (type: string) => void;
  onAssetSubtypeSelect: (subtype: string) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export const WizardSteps = ({
  steps,
  currentStep,
  assetData,
  complianceData,
  onAssetTypeSelect,
  onAssetSubtypeSelect,
  onChange,
  onFileChange,
  onNext,
  onPrev,
  onSubmit,
  isSubmitting,
}: WizardStepsProps) => {
  const { currentNetwork } = useBlockchain();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Update blockchain in asset data when network changes
  useEffect(() => {
    if (currentNetwork) {
      const event = {
        target: {
          name: 'blockchain',
          value: currentNetwork
        }
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  }, [currentNetwork, onChange]);
  
  // Handle file selection with UI feedback
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(filesArray);
      onFileChange(e);
    }
  };
  
  // Validation for current step
  const canProceed = () => {
    if (currentStep === 0) {
      return !!assetData.type;
    } else if (currentStep === 1) {
      return (
        !!assetData.name && 
        assetData.value > 0 && 
        assetData.tokenized > 0
      );
    } else if (currentStep === 2) {
      return !!complianceData.jurisdiction;
    }
    return true;
  };

  // Render the step progress indicator
  const renderStepProgress = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div className="flex items-center w-full">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index < currentStep ? "bg-green-500 text-white" :
                  index === currentStep ? "bg-primary text-white" :
                  "border border-gray-300 dark:border-gray-700"
                }`}
              >
                {index < currentStep ? (
                  <span className="material-icons text-sm">check</span>
                ) : (
                  index + 1
                )}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`w-full max-w-[100px] h-1 mx-2 ${
                  index < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                }`}></div>
              )}
            </div>
            
            <div className="mt-2 text-center">
              <p className={`font-medium ${
                index === currentStep ? "" : "text-gray-500 dark:text-gray-400"
              }`}>{step}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
                {index === 0 ? "Choose asset type" :
                 index === 1 ? "Define properties" :
                 index === 2 ? "Regulatory settings" :
                 "Create tokens"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Step 1: Asset Selection
  const renderAssetSelection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">Select Asset Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.values(AssetType).map((type) => (
            <div 
              key={type}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                assetData.type === type 
                  ? "border-primary bg-primary/5" 
                  : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
              }`}
              onClick={() => onAssetTypeSelect(type)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`material-icons text-2xl ${
                  assetData.type === type ? "text-primary" : "text-gray-500 dark:text-gray-400"
                }`}>
                  {type === "real_estate" ? "apartment" : 
                   type === "invoice" ? "receipt" : 
                   "precision_manufacturing"}
                </span>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  assetData.type === type 
                    ? "border-primary" 
                    : "border-gray-300 dark:border-gray-600"
                }`}>
                  {assetData.type === type && (
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  )}
                </div>
              </div>
              <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {type === "real_estate" 
                  ? "Commercial or residential property assets" 
                  : type === "invoice" 
                    ? "Accounts receivable and invoice bundles" 
                    : "Machinery, vehicles and industrial assets"}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {assetData.type && (
        <div>
          <h3 className="text-lg font-medium mb-4">
            {assetData.type === "real_estate" 
              ? "Real Estate Template" 
              : assetData.type === "invoice" 
                ? "Invoice Template" 
                : "Equipment Template"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assetData.type === "real_estate" && (
              <>
                <div 
                  className={`border rounded-xl p-4 cursor-pointer ${
                    assetData.subtype === "commercial" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => onAssetSubtypeSelect("commercial")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-icons text-gray-500 dark:text-gray-400">business</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      assetData.subtype === "commercial" 
                        ? "border-primary" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {assetData.subtype === "commercial" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">Commercial Property</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Office space, retail, industrial</p>
                </div>
                
                <div 
                  className={`border rounded-xl p-4 cursor-pointer ${
                    assetData.subtype === "residential" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => onAssetSubtypeSelect("residential")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-icons text-gray-500 dark:text-gray-400">home</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      assetData.subtype === "residential" 
                        ? "border-primary" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {assetData.subtype === "residential" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">Residential Property</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Multi-family, single-family homes</p>
                </div>
              </>
            )}
            
            {assetData.type === "invoice" && (
              <>
                <div 
                  className={`border rounded-xl p-4 cursor-pointer ${
                    assetData.subtype === "individual" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => onAssetSubtypeSelect("individual")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-icons text-gray-500 dark:text-gray-400">description</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      assetData.subtype === "individual" 
                        ? "border-primary" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {assetData.subtype === "individual" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">Individual Invoice</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Single invoice tokenization</p>
                </div>
                
                <div 
                  className={`border rounded-xl p-4 cursor-pointer ${
                    assetData.subtype === "bundle" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => onAssetSubtypeSelect("bundle")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-icons text-gray-500 dark:text-gray-400">folder</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      assetData.subtype === "bundle" 
                        ? "border-primary" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {assetData.subtype === "bundle" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">Invoice Bundle</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Multiple invoices grouped together</p>
                </div>
              </>
            )}
            
            {assetData.type === "equipment" && (
              <>
                <div 
                  className={`border rounded-xl p-4 cursor-pointer ${
                    assetData.subtype === "manufacturing" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => onAssetSubtypeSelect("manufacturing")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-icons text-gray-500 dark:text-gray-400">precision_manufacturing</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      assetData.subtype === "manufacturing" 
                        ? "border-primary" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {assetData.subtype === "manufacturing" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">Manufacturing Equipment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Industrial machinery, production lines</p>
                </div>
                
                <div 
                  className={`border rounded-xl p-4 cursor-pointer ${
                    assetData.subtype === "vehicles" 
                      ? "border-primary bg-primary/5" 
                      : "border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primary/5"
                  }`}
                  onClick={() => onAssetSubtypeSelect("vehicles")}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-icons text-gray-500 dark:text-gray-400">local_shipping</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      assetData.subtype === "vehicles" 
                        ? "border-primary" 
                        : "border-gray-300 dark:border-gray-600"
                    }`}>
                      {assetData.subtype === "vehicles" && (
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium">Vehicles & Fleet</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Commercial vehicles, transportation</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium mb-4">Import from Business Systems</h3>
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
          <div className="mb-4">
            <span className="material-icons text-4xl text-gray-400">sync</span>
          </div>
          <h4 className="font-medium mb-2">Connect to Your Systems</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Import asset data directly from your business software
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="outline" className="flex items-center">
              <img 
                src="https://seeklogo.com/images/Q/quickbooks-logo-57733723AB-seeklogo.com.png" 
                alt="QuickBooks" 
                className="w-5 h-5 mr-2" 
              />
              QuickBooks
            </Button>
            <Button variant="outline" className="flex items-center">
              <img 
                src="https://seeklogo.com/images/X/xero-logo-6929DB5A5B-seeklogo.com.png" 
                alt="Xero" 
                className="w-5 h-5 mr-2" 
              />
              Xero
            </Button>
            <Button variant="outline" className="flex items-center">
              <span className="material-icons text-sm mr-1">add</span>
              More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 2: Asset Details
  const renderAssetDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              name="name"
              placeholder="Enter asset name"
              value={assetData.name}
              onChange={onChange}
              required
            />
          </div>
          
          {assetData.type === "real_estate" && (
            <div>
              <Label htmlFor="asset-location">Property Location</Label>
              <Input
                id="asset-location"
                name="location"
                placeholder="City, State"
                value={assetData.location || ""}
                onChange={onChange}
              />
            </div>
          )}
          
          {assetData.type === "invoice" && (
            <div>
              <Label htmlFor="asset-company">Company/Client</Label>
              <Input
                id="asset-company"
                name="company"
                placeholder="Company name"
                value={assetData.company || ""}
                onChange={onChange}
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="asset-value">Asset Value (USD)</Label>
            <Input
              id="asset-value"
              name="value"
              type="number"
              min="0"
              placeholder="Enter asset value"
              value={assetData.value || ""}
              onChange={onChange}
              required
            />
          </div>
          
          <div>
            <Label>Tokenization Percentage: {assetData.tokenized}%</Label>
            <Slider
              name="tokenized"
              min={1}
              max={100}
              step={1}
              value={[assetData.tokenized || 0]}
              onValueChange={([value]) => {
                const event = {
                  target: {
                    name: 'tokenized',
                    value: value.toString()
                  }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }}
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">
                Tokenized Value: {formatCurrency(assetData.tokenizedValue)}
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="asset-liquidity">Liquidity Level</Label>
            <Select 
              value={assetData.liquidity} 
              onValueChange={(value) => {
                const event = {
                  target: {
                    name: 'liquidity',
                    value
                  }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(event);
              }}
            >
              <SelectTrigger id="asset-liquidity">
                <SelectValue placeholder="Select liquidity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="asset-description">Asset Description</Label>
            <Textarea
              id="asset-description"
              name="description"
              placeholder="Describe the asset"
              rows={4}
              value={assetData.description || ""}
              onChange={onChange}
            />
          </div>
          
          <div>
            <Label htmlFor="asset-blockchain">Blockchain Network</Label>
            <Select 
              value={assetData.blockchain} 
              onValueChange={(value) => {
                const event = {
                  target: {
                    name: 'blockchain',
                    value
                  }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(event);
              }}
            >
              <SelectTrigger id="asset-blockchain">
                <SelectValue placeholder="Select blockchain" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Blockchain.ETHEREUM}>
                  <div className="flex items-center">
                    <img 
                      src="https://cryptologos.cc/logos/ethereum-eth-logo.png" 
                      className="w-4 h-4 mr-2" 
                      alt="Ethereum" 
                    />
                    Ethereum
                  </div>
                </SelectItem>
                <SelectItem value={Blockchain.POLYGON}>
                  <div className="flex items-center">
                    <img 
                      src="https://cryptologos.cc/logos/polygon-matic-logo.png" 
                      className="w-4 h-4 mr-2" 
                      alt="Polygon" 
                    />
                    Polygon
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {assetData.blockchain === Blockchain.ETHEREUM && (
              <p className="text-xs text-amber-600 mt-1">
                Note: Ethereum has higher gas fees but may be preferred for high-value assets.
              </p>
            )}
            {assetData.blockchain === Blockchain.POLYGON && (
              <p className="text-xs text-green-600 mt-1">
                Note: Polygon offers lower transaction costs and faster confirmations.
              </p>
            )}
          </div>
          
          <div>
            <Label>Asset Documentation</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-4 mt-1">
              <div className="flex items-center justify-center flex-col">
                <span className="material-icons text-2xl text-gray-400 mb-2">upload_file</span>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Drag & drop files or click to browse
                </p>
                <input
                  type="file"
                  id="document-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  multiple
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('document-upload')?.click()}
                >
                  Browse Files
                </Button>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Uploaded Files:</Label>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex items-center">
                        <span className="material-icons text-gray-500 mr-2">description</span>
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Asset-specific metadata fields */}
          {assetData.type === "real_estate" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metadata-sqft">Square Footage</Label>
                <Input
                  id="metadata-sqft"
                  type="number"
                  min="0"
                  placeholder="Sq. ft."
                  value={assetData.metadata?.sqft || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const event = {
                      target: {
                        name: 'metadata',
                        value: { ...assetData.metadata, sqft: parseInt(value) }
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="metadata-year">Year Built</Label>
                <Input
                  id="metadata-year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="Year"
                  value={assetData.metadata?.year_built || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const event = {
                      target: {
                        name: 'metadata',
                        value: { ...assetData.metadata, year_built: parseInt(value) }
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
              </div>
            </div>
          )}
          
          {assetData.type === "invoice" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metadata-invoice-count">Invoice Count</Label>
                <Input
                  id="metadata-invoice-count"
                  type="number"
                  min="1"
                  placeholder="Number of invoices"
                  value={assetData.metadata?.invoice_count || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const event = {
                      target: {
                        name: 'metadata',
                        value: { ...assetData.metadata, invoice_count: parseInt(value) }
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="metadata-due-date">Due Date</Label>
                <Input
                  id="metadata-due-date"
                  type="date"
                  placeholder="Due date"
                  value={assetData.metadata?.due_date || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const event = {
                      target: {
                        name: 'metadata',
                        value: { ...assetData.metadata, due_date: value }
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
              </div>
            </div>
          )}
          
          {assetData.type === "equipment" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="metadata-manufacturer">Manufacturer</Label>
                <Input
                  id="metadata-manufacturer"
                  placeholder="Manufacturer name"
                  value={assetData.metadata?.manufacturer || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const event = {
                      target: {
                        name: 'metadata',
                        value: { ...assetData.metadata, manufacturer: value }
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
              </div>
              <div>
                <Label htmlFor="metadata-year">Year</Label>
                <Input
                  id="metadata-year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  placeholder="Year"
                  value={assetData.metadata?.year || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    const event = {
                      target: {
                        name: 'metadata',
                        value: { ...assetData.metadata, year: parseInt(value) }
                      }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Compliance
  const renderCompliance = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="compliance-jurisdiction">Jurisdiction</Label>
            <Select 
              value={complianceData.jurisdiction} 
              onValueChange={(value) => {
                const event = {
                  target: {
                    name: 'compliance.jurisdiction',
                    value
                  }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(event);
              }}
            >
              <SelectTrigger id="compliance-jurisdiction">
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="US">United States</SelectItem>
                <SelectItem value="EU">European Union</SelectItem>
                <SelectItem value="UK">United Kingdom</SelectItem>
                <SelectItem value="Asia">Asia</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="compliance-template">Legal Template</Label>
            <Select 
              value={complianceData.templateUsed} 
              onValueChange={(value) => {
                const event = {
                  target: {
                    name: 'compliance.templateUsed',
                    value
                  }
                } as React.ChangeEvent<HTMLSelectElement>;
                onChange(event);
              }}
            >
              <SelectTrigger id="compliance-template">
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {complianceData.jurisdiction === "US" && (
                  <>
                    <SelectItem value="US_RE_STD_1">US Real Estate Standard</SelectItem>
                    <SelectItem value="US_INV_STD_1">US Invoice Standard</SelectItem>
                    <SelectItem value="US_EQP_STD_1">US Equipment Standard</SelectItem>
                  </>
                )}
                {complianceData.jurisdiction === "EU" && (
                  <>
                    <SelectItem value="EU_MiCA_STD_1">EU MiCA Compliant</SelectItem>
                    <SelectItem value="EU_RE_STD_1">EU Real Estate Standard</SelectItem>
                  </>
                )}
                {complianceData.jurisdiction === "UK" && (
                  <>
                    <SelectItem value="UK_FCA_STD_1">UK FCA Compliant</SelectItem>
                  </>
                )}
                {complianceData.jurisdiction === "Asia" && (
                  <>
                    <SelectItem value="ASIA_SG_STD_1">Singapore MAS Standard</SelectItem>
                    <SelectItem value="ASIA_HK_STD_1">Hong Kong SFC Standard</SelectItem>
                  </>
                )}
                <SelectItem value="CUSTOM">Custom Template</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="kyc-required"
              checked={complianceData.kycRequired}
              onCheckedChange={(checked) => {
                const event = {
                  target: {
                    name: 'compliance.kycRequired',
                    value: checked
                  }
                } as unknown as React.ChangeEvent<HTMLInputElement>;
                onChange(event);
              }}
            />
            <Label htmlFor="kyc-required">KYC/AML Required</Label>
          </div>
          
          {complianceData.kycRequired && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center mb-2">
                <span className="material-icons text-primary mr-2">verified_user</span>
                <h4 className="font-medium">KYC/AML Verification</h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Verify your identity to comply with regulatory requirements.
              </p>
              <Button>Start Verification</Button>
            </div>
          )}
          
          <div>
            <Label htmlFor="compliance-notes">Regulatory Notes</Label>
            <Textarea
              id="compliance-notes"
              name="compliance.regulatoryNotes"
              placeholder="Add any regulatory compliance notes"
              rows={4}
              value={complianceData.regulatoryNotes || ""}
              onChange={onChange}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center">
              <span className="material-icons text-primary mr-2">info</span>
              Regulatory Information
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <h5 className="font-medium">Selected Jurisdiction: {complianceData.jurisdiction}</h5>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {complianceData.jurisdiction === "US" 
                    ? "Assets tokenized under US jurisdiction must comply with SEC regulations, potentially including Regulation D or Regulation S exemptions."
                    : complianceData.jurisdiction === "EU" 
                      ? "EU-based assets must comply with MiCA (Markets in Crypto-Assets) regulation and relevant member state laws."
                      : complianceData.jurisdiction === "UK"
                        ? "UK assets must comply with FCA (Financial Conduct Authority) regulations governing tokenized assets."
                        : complianceData.jurisdiction === "Asia"
                          ? "Regulations vary by country in Asia, with Singapore, Hong Kong, and Japan having more established frameworks."
                          : "Please ensure compliance with your local regulatory requirements for tokenized assets."}
                </p>
              </div>
              
              <div>
                <h5 className="font-medium">Key Compliance Requirements</h5>
                <ul className="list-disc pl-5 text-gray-600 dark:text-gray-400">
                  <li>KYC/AML for all investors</li>
                  <li>Proper asset documentation</li>
                  <li>Jurisdiction-specific disclosures</li>
                  <li>Tax reporting compliance</li>
                  <li>Transfer restrictions (if applicable)</li>
                </ul>
              </div>
              
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
                <p className="text-amber-800 dark:text-amber-200 text-xs">
                  Disclaimer: The templates and information provided are for guidance only. 
                  We recommend consulting with a legal professional in your jurisdiction to ensure full compliance.
                </p>
              </div>
            </div>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="font-medium">Compliance Preview</h4>
            </div>
            <div className="p-4 text-sm">
              <div className="mb-4">
                <p className="font-medium">Asset Name:</p>
                <p className="text-gray-600 dark:text-gray-400">{assetData.name || "Not specified"}</p>
              </div>
              <div className="mb-4">
                <p className="font-medium">Asset Type:</p>
                <p className="text-gray-600 dark:text-gray-400 capitalize">{assetData.type?.replace('_', ' ') || "Not specified"}</p>
              </div>
              <div className="mb-4">
                <p className="font-medium">Jurisdiction:</p>
                <p className="text-gray-600 dark:text-gray-400">{complianceData.jurisdiction || "Not specified"}</p>
              </div>
              <div className="mb-4">
                <p className="font-medium">Legal Template:</p>
                <p className="text-gray-600 dark:text-gray-400">{complianceData.templateUsed || "None selected"}</p>
              </div>
              <div className="mb-4">
                <p className="font-medium">KYC/AML:</p>
                <p className="text-gray-600 dark:text-gray-400">{complianceData.kycRequired ? "Required" : "Not required"}</p>
              </div>
              <div>
                <p className="font-medium">Compliance Score:</p>
                <div className="flex items-center mt-1">
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ width: `${complianceData.kycRequired && complianceData.templateUsed ? 90 : 50}%` }}
                    ></div>
                  </div>
                  <span className="ml-2 text-sm">{complianceData.kycRequired && complianceData.templateUsed ? 90 : 50}/100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Step 4: Deploy
  const renderDeploy = () => (
    <div className="space-y-6">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-medium mb-4 flex items-center">
          <span className="material-icons text-green-500 mr-2">check_circle</span>
          Ready to Deploy
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your asset is ready to be tokenized on the blockchain. Review the details below before proceeding.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400">Asset Details</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-medium">{assetData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Type:</span>
                  <span className="font-medium capitalize">{assetData.type?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtype:</span>
                  <span className="font-medium capitalize">{assetData.subtype?.replace('_', ' ') || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Value:</span>
                  <span className="font-medium">{formatCurrency(assetData.value)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokenized:</span>
                  <span className="font-medium">{assetData.tokenized}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tokenized Value:</span>
                  <span className="font-medium">{formatCurrency(assetData.tokenizedValue)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400">Blockchain Details</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Network:</span>
                  <span className="font-medium flex items-center">
                    <img 
                      src={assetData.blockchain === 'ethereum' 
                        ? 'https://cryptologos.cc/logos/ethereum-eth-logo.png' 
                        : 'https://cryptologos.cc/logos/polygon-matic-logo.png'} 
                      className="w-4 h-4 mr-1" 
                      alt={assetData.blockchain} 
                    />
                    {assetData.blockchain.charAt(0).toUpperCase() + assetData.blockchain.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Token Standard:</span>
                  <span className="font-medium">ERC-3643</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Gas Fee:</span>
                  <span className="font-medium">
                    {assetData.blockchain === 'ethereum' ? '$15-25' : '$0.1-0.5'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400">Compliance Status</h4>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span>Jurisdiction:</span>
                  <span className="font-medium">{complianceData.jurisdiction}</span>
                </div>
                <div className="flex justify-between">
                  <span>Template:</span>
                  <span className="font-medium">{complianceData.templateUsed || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span>KYC Required:</span>
                  <span className="font-medium">{complianceData.kycRequired ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span>KYC Status:</span>
                  <span className={`font-medium ${complianceData.kycCompleted ? "text-green-500" : "text-amber-500"}`}>
                    {complianceData.kycCompleted ? "Completed" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-500 dark:text-gray-400">Documentation</h4>
              <div className="mt-2">
                {uploadedFiles.length > 0 ? (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center">
                        <span className="material-icons text-gray-500 mr-2">description</span>
                        <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-amber-500 flex items-center">
                    <span className="material-icons text-sm mr-1">warning</span>
                    No documents uploaded
                  </p>
                )}
              </div>
            </div>
            
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">Deployment Preview</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Upon submission, the following will happen:
              </p>
              <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal pl-4">
                <li>Documents will be uploaded to IPFS</li>
                <li>Smart contract will be deployed on {assetData.blockchain}</li>
                <li>Tokens will be created representing your asset</li>
                <li>Asset will appear in your portfolio</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 p-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-900 rounded-lg">
        <span className="material-icons text-yellow-500">info</span>
        <div>
          <p className="text-sm">
            By proceeding, you confirm that all provided information is accurate and that you have the legal right to tokenize this asset.
          </p>
        </div>
      </div>
    </div>
  );

  // Render content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderAssetSelection();
      case 1:
        return renderAssetDetails();
      case 2:
        return renderCompliance();
      case 3:
        return renderDeploy();
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Step progress indicator */}
      {renderStepProgress()}
      
      {/* Step content */}
      <div className="mb-6">
        {renderStepContent()}
      </div>
      
      {/* Step navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? undefined : onPrev}
          disabled={currentStep === 0}
        >
          {currentStep === 0 ? "Cancel" : "Previous"}
        </Button>
        
        {currentStep < steps.length - 1 ? (
          <Button 
            onClick={onNext}
            disabled={!canProceed()}
          >
            Continue to {steps[currentStep + 1]}
          </Button>
        ) : (
          <Button 
            onClick={onSubmit}
            disabled={isSubmitting || !canProceed()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <>
                <span className="material-icons animate-spin mr-2">refresh</span>
                Processing...
              </>
            ) : (
              <>
                Deploy Tokens
                <span className="material-icons ml-1">rocket_launch</span>
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};
