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

        // Force enable introspection
        const enableIntrospection = process.env.NODE_ENV === "development"? true : false;
        console.log(`🔍 Introspection is set to: ${enableIntrospection ? 'ENABLED' : 'DISABLED'}`);

        // Create Apollo Server instance
        const server = new ApolloServer({
            typeDefs,
            resolvers,
            introspection: enableIntrospection,
            includeStacktrace: process.env.NODE_ENV === 'development',
            csrfPrevention:false,
            formatError: (formattedError, error) => {
                // Log the error
                console.error("GraphQL Error:", error);
                // If the error is an instance of our AppError class
                if (error.originalError instanceof AppError) {
                    return {
                        message: error.message,
                        extensions: {
                            code: error.originalError.name,
                            statusCode: error.originalError.statusCode,
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
            listen: {port: process.env.PORT || 4000},
            context: async ({req}) => {
                // Special handling for introspection queries
                const query = req.body?.query || '';
                // if (query.includes('__schema') || query.includes('__type')) {
                //     // console.log("🔍 Processing introspection query");
                //     // return {}; // Return empty context for introspection
                // }

                // Normal context for other queries
                return await context({req});
            },
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
                allowedHeaders: ["Content-Type", "Authorization"],
                credentials: true,
            },
        });

        console.log(`✅ Server ready at ${url}`);
        console.log(`🔍 Introspection is ${enableIntrospection ? 'ENABLED' : 'DISABLED'}`);
    } catch (error) {
        console.error("❌ Failed to start server:", error.stack);
        process.exit(1);
    }
}

startServer()
    .then(() => console.log("✅ Server started successfully"))
    .catch((error) => {
        console.error("❌ Server failed to start:", error.stack);
    });