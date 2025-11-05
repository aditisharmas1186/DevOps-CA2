import mongoose from "mongoose";
import { DB_NAME } from "./../../constants.js";

export const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI + DB_NAME;
    console.log("Connecting to:", uri);
    
    const connectionInstance = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("MongoDB connected. DB Host: ", connectionInstance.connection.host);
  } catch (error) {
    console.log("MongoDB connection error: ", error.message);
    process.exit(1);
  }
};