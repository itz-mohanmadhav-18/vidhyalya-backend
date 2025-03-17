import {gql} from 'graphql-tag'

const adminDef = gql`
    extend type Mutation {
        loginAdmin(input: AdminLoginInput!): Token
    }
    
    input AdminLoginInput {
        _id: ID!
        password: String!
    }

`

export default adminDef;

