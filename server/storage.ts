import { 
  users, 
  assets, 
  compliance, 
  transactions, 
  regulatoryUpdates,
  type User, 
  type InsertUser, 
  type Asset, 
  type InsertAsset,
  type Compliance,
  type InsertCompliance,
  type Transaction,
  type InsertTransaction,
  type RegulatoryUpdate,
  type InsertRegulatoryUpdate
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Asset operations
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsByUserId(userId: number): Promise<Asset[]>;
  getAllAssets(): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: number, asset: Partial<Asset>): Promise<Asset | undefined>;
  deleteAsset(id: number): Promise<boolean>;
  
  // Compliance operations
  getComplianceByAssetId(assetId: number): Promise<Compliance | undefined>;
  createCompliance(compliance: InsertCompliance): Promise<Compliance>;
  updateCompliance(id: number, compliance: Partial<Compliance>): Promise<Compliance | undefined>;
  
  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByAssetId(assetId: number): Promise<Transaction[]>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction | undefined>;
  
  // Regulatory updates operations
  getRegulatoryUpdate(id: number): Promise<RegulatoryUpdate | undefined>;
  getAllRegulatoryUpdates(): Promise<RegulatoryUpdate[]>;
  getRegulatoryUpdatesByJurisdiction(jurisdiction: string): Promise<RegulatoryUpdate[]>;
  createRegulatoryUpdate(update: InsertRegulatoryUpdate): Promise<RegulatoryUpdate>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assets: Map<number, Asset>;
  private complianceRecords: Map<number, Compliance>;
  private transactions: Map<number, Transaction>;
  private regulatoryUpdates: Map<number, RegulatoryUpdate>;
  
  private currentUserId: number;
  private currentAssetId: number;
  private currentComplianceId: number;
  private currentTransactionId: number;
  private currentUpdateId: number;

  constructor() {
    this.users = new Map();
    this.assets = new Map();
    this.complianceRecords = new Map();
    this.transactions = new Map();
    this.regulatoryUpdates = new Map();
    
    this.currentUserId = 1;
    this.currentAssetId = 1;
    this.currentComplianceId = 1;
    this.currentTransactionId = 1;
    this.currentUpdateId = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt,
      company: insertUser.company ?? null,
      plan: insertUser.plan ?? 'Starter' 
    };
    this.users.set(id, user);
    return user;
  }

  // Asset operations
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async getAssetsByUserId(userId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.userId === userId,
    );
  }
  
  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values());
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.currentAssetId++;
    const createdAt = new Date();
    const asset: Asset = { 
      ...insertAsset, 
      id, 
      createdAt, 
      updatedAt: createdAt,
      subtype: insertAsset.subtype ?? null,
      description: insertAsset.description ?? null,
      location: insertAsset.location ?? null,
      company: insertAsset.company ?? null,
      tokenized: insertAsset.tokenized ?? 0,
      tokenizedValue: insertAsset.tokenizedValue ?? 0,
      liquidity: insertAsset.liquidity ?? 'low',
      status: insertAsset.status ?? 'draft',
      ipfsHash: insertAsset.ipfsHash ?? null,
      contractAddress: insertAsset.contractAddress ?? null,
      metadata: insertAsset.metadata ?? {}
    };
    this.assets.set(id, asset);
    return asset;
  }

  async updateAsset(id: number, assetUpdate: Partial<Asset>): Promise<Asset | undefined> {
    const existingAsset = this.assets.get(id);
    if (!existingAsset) {
      return undefined;
    }
    
    const updatedAsset: Asset = {
      ...existingAsset,
      ...assetUpdate,
      updatedAt: new Date()
    };
    
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }

  async deleteAsset(id: number): Promise<boolean> {
    return this.assets.delete(id);
  }

  // Compliance operations
  async getComplianceByAssetId(assetId: number): Promise<Compliance | undefined> {
    return Array.from(this.complianceRecords.values()).find(
      (record) => record.assetId === assetId,
    );
  }

  async createCompliance(insertCompliance: InsertCompliance): Promise<Compliance> {
    const id = this.currentComplianceId++;
    const updatedAt = new Date();
    const compliance: Compliance = { 
      ...insertCompliance, 
      id, 
      updatedAt, 
      kycRequired: insertCompliance.kycRequired ?? true,
      kycCompleted: insertCompliance.kycCompleted ?? false,
      templateUsed: insertCompliance.templateUsed ?? null,
      regulatoryNotes: insertCompliance.regulatoryNotes ?? null,
      complianceScore: insertCompliance.complianceScore ?? null
    };
    this.complianceRecords.set(id, compliance);
    return compliance;
  }

  async updateCompliance(id: number, complianceUpdate: Partial<Compliance>): Promise<Compliance | undefined> {
    const existingCompliance = this.complianceRecords.get(id);
    if (!existingCompliance) {
      return undefined;
    }
    
    const updatedCompliance: Compliance = {
      ...existingCompliance,
      ...complianceUpdate,
      updatedAt: new Date()
    };
    
    this.complianceRecords.set(id, updatedCompliance);
    return updatedCompliance;
  }

  // Transaction operations
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByAssetId(assetId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.assetId === assetId,
    );
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.buyerId === userId || transaction.sellerId === userId,
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const createdAt = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt,
      buyerId: insertTransaction.buyerId ?? null,
      sellerId: insertTransaction.sellerId ?? null,
      transactionHash: insertTransaction.transactionHash ?? null
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, transactionUpdate: Partial<Transaction>): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) {
      return undefined;
    }
    
    const updatedTransaction: Transaction = {
      ...existingTransaction,
      ...transactionUpdate
    };
    
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Regulatory updates operations
  async getRegulatoryUpdate(id: number): Promise<RegulatoryUpdate | undefined> {
    return this.regulatoryUpdates.get(id);
  }

  async getAllRegulatoryUpdates(): Promise<RegulatoryUpdate[]> {
    return Array.from(this.regulatoryUpdates.values());
  }

  async getRegulatoryUpdatesByJurisdiction(jurisdiction: string): Promise<RegulatoryUpdate[]> {
    return Array.from(this.regulatoryUpdates.values()).filter(
      (update) => update.jurisdiction === jurisdiction,
    );
  }

  async createRegulatoryUpdate(insertUpdate: InsertRegulatoryUpdate): Promise<RegulatoryUpdate> {
    const id = this.currentUpdateId++;
    const update: RegulatoryUpdate = { ...insertUpdate, id };
    this.regulatoryUpdates.set(id, update);
    return update;
  }

  // Initialize with sample data for development
  private initSampleData() {
    // Create a sample user
    const user: User = {
      id: this.currentUserId++,
      username: 'johnsmith',
      password: 'hashed_password',
      email: 'john@example.com',
      fullName: 'John Smith',
      company: 'ABC Corp',
      plan: 'Growth',
      createdAt: new Date()
    };
    this.users.set(user.id, user);

    // Create sample assets
    const sampleAssets: InsertAsset[] = [
      {
        name: 'Downtown Office Complex',
        userId: user.id,
        type: 'real_estate',
        subtype: 'commercial',
        description: 'Prime commercial office space in downtown area',
        location: 'San Francisco, CA',
        company: null,
        value: 750000,
        tokenized: 85,
        tokenizedValue: 637500,
        liquidity: 'high',
        blockchain: 'ethereum',
        status: 'active',
        ipfsHash: 'ipfs://Qm123456789',
        contractAddress: '0x1234567890abcdef',
        metadata: { floors: 12, sqft: 25000, year_built: 2010 }
      },
      {
        name: 'Q4 2023 Invoice Bundle',
        userId: user.id,
        type: 'invoice',
        subtype: 'tech_services',
        description: 'Collection of Q4 invoices for technology services',
        location: null,
        company: 'Tech Services',
        value: 120000,
        tokenized: 100,
        tokenizedValue: 120000,
        liquidity: 'medium',
        blockchain: 'polygon',
        status: 'active',
        ipfsHash: 'ipfs://Qm987654321',
        contractAddress: '0xabcdef1234567890',
        metadata: { invoice_count: 8, due_date: '2023-12-31' }
      },
      {
        name: 'CNC Machine Fleet',
        userId: user.id,
        type: 'equipment',
        subtype: 'manufacturing',
        description: 'Fleet of industrial CNC machines for manufacturing',
        location: null,
        company: 'Manufacturing',
        value: 350000,
        tokenized: 60,
        tokenizedValue: 210000,
        liquidity: 'low',
        blockchain: 'polygon',
        status: 'pending',
        ipfsHash: 'ipfs://Qm567890123',
        contractAddress: '0x567890abcdef1234',
        metadata: { machine_count: 5, year: 2020, manufacturer: 'Industrial Inc.' }
      },
      {
        name: 'Westfield Retail Space',
        userId: user.id,
        type: 'real_estate',
        subtype: 'retail',
        description: 'Retail storefront in popular shopping district',
        location: 'Chicago, IL',
        company: null,
        value: 480000,
        tokenized: 35,
        tokenizedValue: 168000,
        liquidity: 'medium',
        blockchain: 'ethereum',
        status: 'compliance_issue',
        ipfsHash: 'ipfs://Qm345678901',
        contractAddress: '0x3456789012abcdef',
        metadata: { sqft: 3500, year_built: 2015 }
      }
    ];

    for (const assetData of sampleAssets) {
      const asset: Asset = {
        ...assetData,
        id: this.currentAssetId++,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.assets.set(asset.id, asset);

      // Create compliance records for each asset
      const complianceRecord: Compliance = {
        id: this.currentComplianceId++,
        assetId: asset.id,
        jurisdiction: asset.id === 4 ? 'EU' : 'US',
        kycRequired: true,
        kycCompleted: asset.id !== 4,
        templateUsed: asset.type === 'real_estate' ? 'US_RE_STD_1' : 'US_GEN_STD_1',
        regulatoryNotes: asset.id === 4 ? 'Missing EU MiCA compliance documentation' : '',
        complianceScore: asset.id === 4 ? 65 : 92,
        updatedAt: new Date()
      };
      this.complianceRecords.set(complianceRecord.id, complianceRecord);
    }

    // Create sample transactions
    const sampleTransactions: InsertTransaction[] = [
      {
        assetId: 2, // Invoice Bundle
        buyerId: null,
        sellerId: user.id,
        tokenAmount: 5,
        valueAmount: 12500,
        transactionType: 'sale',
        status: 'completed',
        transactionHash: '0xabcd1234567890'
      },
      {
        assetId: 1, // Office Complex
        buyerId: user.id,
        sellerId: null,
        tokenAmount: 3,
        valueAmount: 22500,
        transactionType: 'purchase',
        status: 'completed',
        transactionHash: '0x1234abcd567890'
      },
      {
        assetId: 3, // CNC Machine
        buyerId: null,
        sellerId: null,
        tokenAmount: 10,
        valueAmount: 35000,
        transactionType: 'offer',
        status: 'pending',
        transactionHash: null
      },
      {
        assetId: 4, // Retail Space
        buyerId: null,
        sellerId: user.id,
        tokenAmount: 8,
        valueAmount: 16800,
        transactionType: 'listing',
        status: 'active',
        transactionHash: null
      }
    ];

    for (const txData of sampleTransactions) {
      const transaction: Transaction = {
        ...txData,
        id: this.currentTransactionId++,
        createdAt: new Date()
      };
      this.transactions.set(transaction.id, transaction);
    }

    // Create sample regulatory updates
    const sampleUpdates: InsertRegulatoryUpdate[] = [
      {
        title: 'MiCA Compliance Update Required',
        description: 'New EU regulations affecting real estate tokenization. Action needed for specific assets.',
        jurisdiction: 'EU',
        severity: 'warning',
        assetTypesAffected: ['real_estate'],
        actionRequired: true,
        actionDescription: 'Update compliance documentation according to new MiCA guidelines',
        publishDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 45))
      },
      {
        title: 'SEC Framework Update',
        description: 'New guidelines for fractional ownership of equipment assets. No immediate action required.',
        jurisdiction: 'US',
        severity: 'info',
        assetTypesAffected: ['equipment'],
        actionRequired: false,
        actionDescription: null,
        publishDate: new Date(),
        expiryDate: null
      },
      {
        title: 'Tax Reporting Change',
        description: 'Updated requirements for quarterly reporting on tokenized assets.',
        jurisdiction: 'US',
        severity: 'info',
        assetTypesAffected: ['real_estate', 'invoice', 'equipment'],
        actionRequired: false,
        actionDescription: 'Prepare for new reporting format in next quarter',
        publishDate: new Date(),
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 45))
      }
    ];

    for (const updateData of sampleUpdates) {
      const update: RegulatoryUpdate = {
        ...updateData,
        id: this.currentUpdateId++
      };
      this.regulatoryUpdates.set(update.id, update);
    }
  }
}

export const storage = new MemStorage();
