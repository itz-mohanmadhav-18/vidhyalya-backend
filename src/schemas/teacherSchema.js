import {gql} from "apollo-server";

const teacherDef = gql` 
    type Teacher {
        id: ID!
        name: String!
        age: Int!
        contact: String!
        dateOfJoining: String!
    }
    
    extend type Query {
        teachers: [Teacher]
        teacher(id: ID!): Teacher
        
    }
    
    extend type Mutation {
        addTeacher(input:TeacherInput!): Teacher
        updateTeacher(input:TeacherUpdateInput!): Teacher
        deleteTeacher(id: ID!): Teacher
    }
    
    input TeacherInput {
        name: String!
        age: Int!
        contact: String!
    }
    
    input TeacherUpdateInput {
        name: String
        age: Int
        contact: String
    }
    
`;

export default teacherDef;