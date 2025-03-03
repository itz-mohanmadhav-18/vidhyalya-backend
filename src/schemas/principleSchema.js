import {gql}  from "graphql-tag";

const principleDef = gql`
    
    type Principle {
        EmployeeID: ID @deprecated(reason: "Use '_id' instead")
        _id: ID!
        name: String!
        dob: String!
        contact: String!
        email: String!
        gender: Gender!
        Qualifications: [String!]!
        Experience: Int!
        dateOfJoining: String!
    }
    type Token{
        token:String!
    }
    
    type Query {
        principles: [Principle]!
        principle(_id: ID!): Principle
        
    }
    
    enum Gender{
        male
        female
        others
    }
    
    type Mutation {
        addPrinciple(input:PrincipleInput!): Principle
        signInPrinciple(input:PrincipleSignInInput!): Token
        updatePrinciple(input:PrincipleUpdateInput!): Principle
        deletePrinciple(_id: ID!): Principle
    }
    
    input PrincipleInput {
        name: String!
        dob: String!
        contact: String!
        email: String!
        gender: Gender!
        Qualifications: [String]!
        Experience: Int!
        dateOfJoining: String!
        password: String!
    }
    
    input PrincipleUpdateInput {
        _id: ID
        name: String
        dob: String
        contact: String
        email: String
        Qualifications: [String]
        Experience: Int
    }
    input PrincipleSignInInput {
        _id: ID!
        password: String!
    }
    
`;

export default principleDef;