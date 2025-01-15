const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schemas/schema');
const resolvers = require('./resolvers/resolvers');
require('dotenv').config();
const connectDB = require('./db');

connectDB();


const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: process.env.PORT }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
