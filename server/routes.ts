import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertAssetSchema, insertComplianceSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't return the password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/users", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(userData.username);
      if (existingUserByUsername) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(userData.email);
      if (existingUserByEmail) {
        return res.status(409).json({ message: "Email already exists" });
      }
      
      const newUser = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  // Asset routes
  app.get("/api/assets", async (_req: Request, res: Response) => {
    const assets = await storage.getAllAssets();
    res.json(assets);
  });
  
  app.get("/api/assets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    const asset = await storage.getAsset(id);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    res.json(asset);
  });
  
  app.get("/api/users/:userId/assets", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const assets = await storage.getAssetsByUserId(userId);
    res.json(assets);
  });
  
  app.post("/api/assets", async (req: Request, res: Response) => {
    try {
      const assetData = insertAssetSchema.parse(req.body);
      
      // Check if user exists
      const user = await storage.getUser(assetData.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newAsset = await storage.createAsset(assetData);
      res.status(201).json(newAsset);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid asset data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating asset" });
    }
  });
  
  app.patch("/api/assets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    try {
      const asset = await storage.getAsset(id);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const updatedAsset = await storage.updateAsset(id, req.body);
      res.json(updatedAsset);
    } catch (error) {
      res.status(500).json({ message: "Error updating asset" });
    }
  });
  
  app.delete("/api/assets/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    const deleted = await storage.deleteAsset(id);
    if (!deleted) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    res.status(204).send();
  });
  
  // Compliance routes
  app.get("/api/assets/:assetId/compliance", async (req: Request, res: Response) => {
    const assetId = parseInt(req.params.assetId);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    const compliance = await storage.getComplianceByAssetId(assetId);
    if (!compliance) {
      return res.status(404).json({ message: "Compliance record not found" });
    }
    
    res.json(compliance);
  });
  
  app.post("/api/compliance", async (req: Request, res: Response) => {
    try {
      const complianceData = insertComplianceSchema.parse(req.body);
      
      // Check if asset exists
      const asset = await storage.getAsset(complianceData.assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      // Check if compliance record already exists
      const existingCompliance = await storage.getComplianceByAssetId(complianceData.assetId);
      if (existingCompliance) {
        return res.status(409).json({ message: "Compliance record already exists for this asset" });
      }
      
      const newCompliance = await storage.createCompliance(complianceData);
      res.status(201).json(newCompliance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid compliance data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating compliance record" });
    }
  });
  
  app.patch("/api/compliance/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid compliance ID" });
    }
    
    try {
      const updatedCompliance = await storage.updateCompliance(id, req.body);
      if (!updatedCompliance) {
        return res.status(404).json({ message: "Compliance record not found" });
      }
      
      res.json(updatedCompliance);
    } catch (error) {
      res.status(500).json({ message: "Error updating compliance record" });
    }
  });
  
  // Transaction routes
  app.get("/api/transactions", async (_req: Request, res: Response) => {
    const transactions = await Promise.all(
      Array.from({ length: 4 }, async (_, i) => {
        return storage.getTransaction(i + 1);
      })
    );
    res.json(transactions.filter(Boolean));
  });
  
  app.get("/api/assets/:assetId/transactions", async (req: Request, res: Response) => {
    const assetId = parseInt(req.params.assetId);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    const transactions = await storage.getTransactionsByAssetId(assetId);
    res.json(transactions);
  });
  
  app.get("/api/users/:userId/transactions", async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const transactions = await storage.getTransactionsByUserId(userId);
    res.json(transactions);
  });
  
  app.post("/api/transactions", async (req: Request, res: Response) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      
      // Check if asset exists
      const asset = await storage.getAsset(transactionData.assetId);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      const newTransaction = await storage.createTransaction(transactionData);
      res.status(201).json(newTransaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid transaction data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating transaction" });
    }
  });
  
  app.patch("/api/transactions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid transaction ID" });
    }
    
    try {
      const updatedTransaction = await storage.updateTransaction(id, req.body);
      if (!updatedTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "Error updating transaction" });
    }
  });
  
  // Regulatory updates routes
  app.get("/api/regulatory-updates", async (_req: Request, res: Response) => {
    const updates = await storage.getAllRegulatoryUpdates();
    res.json(updates);
  });
  
  app.get("/api/regulatory-updates/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid update ID" });
    }
    
    const update = await storage.getRegulatoryUpdate(id);
    if (!update) {
      return res.status(404).json({ message: "Regulatory update not found" });
    }
    
    res.json(update);
  });
  
  app.get("/api/regulatory-updates/jurisdiction/:jurisdiction", async (req: Request, res: Response) => {
    const jurisdiction = req.params.jurisdiction;
    const updates = await storage.getRegulatoryUpdatesByJurisdiction(jurisdiction);
    res.json(updates);
  });

  const httpServer = createServer(app);
  return httpServer;
}
