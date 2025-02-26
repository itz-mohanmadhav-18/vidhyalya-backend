import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from "mongoose";
import { DatabaseConnectionError } from "./utils/errors.js"

// Get the current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables first, before any other operations
dotenv.config({ path: join(__dirname, '../config.env') });
console.log(process.env.MONGO)
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO;

        // Additional validation
        if (!mongoURI) {
            throw new Error("MongoDB URI is not defined in environment variables!");
        }

        // Connect using the stored URI
        await mongoose.connect(mongoURI);

        console.log("✅ MongoDB Connected Successfully");
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error.message);
        // Log the full error for debugging
        console.error("Full error:", error);
        process.exit(1);
        throw new DatabaseConnectionError();
    }
};

export { connectDB };