import {gql}  from "apollo-server";

const principleDef = gql`
    
    type Principle {
        EmployeeID: ID!
        name: String!
        dob: String!
        contact: String!
        email: String!
        gender: String!
        Qualifications: [String]!
        Experience: Int!
        dateOfJoining: String!
        password: String!
    }
    type Token{
        token:String!
    }
    
    type Query {
        principles: [Principle]
        principle(EmployeeID: ID!): Principle
        
    }
    
    type Mutation {
        addPrinciple(input:PrincipleInput!): Principle
        signInPrinciple(input:PrincipleSignInInput!): Token
        updatePrinciple(input:PrincipleUpdateInput!): Principle
        deletePrinciple(employeeID: ID!): Principle
    }
    
    input PrincipleInput {
        name: String!
        dob: String!
        contact: String!
        email: String!
        gender: String!
        Qualifications: [String]!
        Experience: Int!
        dateOfJoining: String!
        password: String!
    }
    
    input PrincipleUpdateInput {
        name: String!
        dob: String!
        contact: String!
        email: String!
        Qualifications: [String]!
        Experience: Int!
    }
    input PrincipleSignInInput {
        EmployeeID: ID!
        password: String!
    }
    
`;

export default principleDef;