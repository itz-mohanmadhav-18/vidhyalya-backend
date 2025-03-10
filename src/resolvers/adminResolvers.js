import jwt from "jsonwebtoken";
import {fileURLToPath} from "url";
import {dirname, join} from "path";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: join(__dirname, '../../.env')});

// Check if JWT_SECRET is defined
if (!process.env.JWT_SECRET) {
    console.error("WARNING: JWT_SECRET is not defined in environment variables");
}

const AdminResolvers = {
    Mutation: {
        // Updated to match the GraphQL mutation's input parameter
        loginAdmin: async (_, { input }) => {
            // Extract fields from input
            const { _id, password } = input;

            if (_id === "25020000" && password === "admin123") {
                // Fixed JWT sign parameters
                const token = jwt.sign(
                    { _id, role: "admin" },
                    process.env.JWT_SECRET || "fallback_secret",
                    { expiresIn: '1d' }
                );

                // console.log("Generated token:", token);
                return { token };
            }

            // Return null or throw an error for failed authentication
            throw new Error("Invalid credentials");
        }
    }
}

export default AdminResolvers;