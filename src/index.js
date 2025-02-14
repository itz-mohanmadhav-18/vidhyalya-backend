import {ApolloServer} from "@apollo/server";
import {startStandaloneServer} from "@apollo/server/standalone";
import typeDefs from "./schemas/index.js";
import resolvers from "./resolvers/index.js";
import {connectDB} from "./db.js";
import context from "./context.js";
import {AppError} from "./utils/errors.js";

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
            // formatError: (formattedError) => {
            //     const err = formattedError.originalError;
            //     console.error(`GraphQL Error: ${err instanceof AppError ? err.message : "Unexpected Error Occurred."}`);
            //
            //     if (err instanceof AppError) {
            //         return {
            //             message: err.message,
            //             statusCode: err.statusCode || 500,
            //             code: err.name,
            //         };
            //     }
            //     if (formattedError.extensions?.code) {
            //         return {
            //             message: formattedError.message,
            //             statusCode: formattedError.extensions?.code === 'INTERNAL_SERVER_ERROR' ? 500 : 400,
            //             code: formattedError.extensions?.code,
            //         }
            //     }
            //
            //     return {
            //         message: "Internal Server Error",
            //         statusCode: 500,
            //         code: "INTERNAL_SERVER_ERROR",
            //     };
            // },
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
                methods:["POST"],
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