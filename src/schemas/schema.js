const { gql } = require('apollo-server');

const typeDefs = gql`
  type Student {
    id: ID!
    name: String!
    age: Int!
    class: String!
  }

  type Query {
    students: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    addStudent(name: String!, age: Int!, class: String!): Student
    updateStudent(id: ID!, name: String, age: Int, class: String): Student
    deleteStudent(id: ID!): String
  }
`;

module.exports = typeDefs;

