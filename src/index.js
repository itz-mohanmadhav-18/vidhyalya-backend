import {ApolloServer} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";
import typeDefs from "./schemas/index.js";
import resolvers from "./resolvers/index.js";
import {connectDB} from "./db.js";
import context from "./context.js";
import {AppError} from "./utils/errors.js";
import logger from "./utils/logger.js";

console.log("🚀 Server script started");

async function startServer() {
    try {
        console.log("🔄 Connecting to database...");
        await connectDB();
        console.log("✅ Database connected!");

        // Create Apollo Server instance
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            introspection: true, // Enable introspection in server config
            includeStacktrace: process.env.NODE_ENV === 'development',
            formatError: (formattedError, error) => {
                // Log the error
                logger.error(error);

                // If the error is an instance of our AppError class
                if (error.originalError instanceof AppError) {
                    // Return a properly formatted error with the correct code and status
                    return {
                        message: error.message,
                        extensions: {
                            code: error.originalError.name,
                            statusCode: error.originalError.statusCode,
                            // You can add additional fields if needed
                            path: formattedError.path
                        }
                    };
                }

                // For unexpected errors, return a generic message in production
                return {
                    message: process.env.NODE_ENV === 'production'
                        ? 'An unexpected error occurred'
                        : error.message,
                    extensions: {
                        code: 'INTERNAL_SERVER_ERROR',
                        statusCode: 500,
                        path: formattedError.path
                    }
                };
            }
        });

        console.log("🚀 Starting Apollo Server...");

        // Start server in standalone mode
        const {url} = await startStandaloneServer(server, {
            listen: {port: 4000},
            context: async ({req}) => {
                return await context({req});
            },
            cors: {
                origin: "*",
                methods: ["POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            },
            // Add these options for the standalone server
            introspection: true,
        });

        console.log(`✅ Server ready at ${url}`);
    } catch (error) {
        console.error("❌ Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer()
    .then(() => console.log("✅ Server started successfully"))
    .catch((error) => {
        console.error("❌ Server failed to start:", error.message);
    });