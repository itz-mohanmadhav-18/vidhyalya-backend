import {ApolloServer,gql}  from "apollo-server";

const principleDef = gql`
    
    type Principle {
        id: ID!
        name: String!
        age: Int!
        contact: String!
        dateOfJoining: String!
    }
    
    type Query {
        principles: [Principle]
        principle(id: ID!): Principle
        
    }
    
    type Mutation {
        addPrinciple(input:PrincipleInput!): Principle
        updatePrinciple(input:PrincipleUpdateInput!): Principle
        deletePrinciple(id: ID!): Principle
    }
    
    input PrincipleInput {
        name: String!
        age: Int!
        contact: String!
    }
    
    input PrincipleUpdateInput {
        name: String
        age: Int
        contact: String
    }
    
`;

export default principleDef;