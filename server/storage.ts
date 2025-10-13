import { Analysis } from './models/Analysis';
import mongoose from 'mongoose';

export interface IAnalysis {
  imageUrl: string;
  results: {
    ec: number;      // E.coli
    sa: number;      // S.Aureus  
    kp: number;      // Klebsiella Pneumonae
    invalid: number; // Invalid classification
  };
  notes?: string;
  timestamp?: Date;
}

export interface IStorage {
  createAnalysis(result: IAnalysis): Promise<IAnalysis>;
  getAnalysis(id: string): Promise<IAnalysis | null>;
  getAllAnalyses(): Promise<IAnalysis[]>;
}

// Fallback in-memory storage when MongoDB is unavailable
export class MemoryStorage implements IStorage {
  private analyses: Map<string, IAnalysis>;

  constructor() {
    this.analyses = new Map();
  }

  async createAnalysis(result: IAnalysis): Promise<IAnalysis> {
    const id = Math.random().toString(36).substring(7);
    const analysis = { ...result, _id: id, timestamp: new Date() };
    this.analyses.set(id, analysis);
    return analysis;
  }

  async getAnalysis(id: string): Promise<IAnalysis | null> {
    return this.analyses.get(id) || null;
  }

  async getAllAnalyses(): Promise<IAnalysis[]> {
    return Array.from(this.analyses.values()).sort((a, b) => 
      (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  }
}

export class MongoStorage implements IStorage {
  async createAnalysis(result: IAnalysis): Promise<IAnalysis> {
    try {
      const analysis = new Analysis({
        ...result,
        timestamp: new Date()
      });
      const saved = await analysis.save();
      return saved.toObject() as IAnalysis;
    } catch (error) {
      console.error('Error saving to MongoDB:', error);
      throw error;
    }
  }

  async getAnalysis(id: string): Promise<IAnalysis | null> {
    try {
      const result = await Analysis.findById(id);
      return result ? result.toObject() as IAnalysis : null;
    } catch (error) {
      console.error('Error fetching from MongoDB:', error);
      throw error;
    }
  }

  async getAllAnalyses(): Promise<IAnalysis[]> {
    try {
      const results = await Analysis.find().sort({ timestamp: -1 });
      return results.map(doc => doc.toObject() as IAnalysis);
    } catch (error) {
      console.error('Error fetching all from MongoDB:', error);
      throw error;
    }
  }
}

// Create both storage instances
const mongoStorage = new MongoStorage();
const memoryStorage = new MemoryStorage();

// Export a proxy that switches between MongoDB and in-memory storage based on connection state
export const storage = new Proxy({} as IStorage, {
  get: (target, prop) => {
    const isMongoConnected = mongoose.connection.readyState === 1;
    const currentStorage = isMongoConnected ? mongoStorage : memoryStorage;
    return currentStorage[prop as keyof IStorage];
  }
});