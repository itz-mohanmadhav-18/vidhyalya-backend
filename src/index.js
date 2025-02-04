import { ApolloServer } from "apollo-server";
import typeDefs from "./schemas/index.js";
import resolvers from "./resolvers/index.js";
import {connectDB} from "./db.js";
connectDB();
// Apollo Server Setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
});

// Start the Apollo server
server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});