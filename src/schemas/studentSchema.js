import {gql} from 'graphql-tag';

const studentDef = gql`
    type Student {
        _id: ID!
        name: String!
        dob: String!
        gender: Gender!
        contact: String!
        email: String!
        fatherName: String!
        fatherContact: String!
        fatherEmail: String!
        motherName: String!
        motherContact: String!
        address: String!
        previousSchool: String!
        admissionDate: String!
        classID: ID!
        class: Class!
        aadharNumber: String!
    }
    
    extend type Query {
        studentByID(_id: ID!): Student
        students: [Student!]!
        studentsByClass(classID: ID!): [Student!]!
        studentsByAdmissionDate(admissionDate: String!): [Student!]!
    }
    
    extend type Mutation {
        addStudent(input: StudentInput!): Student
        loginStudent(input: StudentLoginInput!): Token
        updateStudent(input: StudentUpdateInput!): Student
        deleteStudent(_id: ID!): Student
        updateStudentClass(input: UpdateStudentClassInput!): Student
        changeStudentPassword(input: ChangePasswordInput!): Boolean
    }
    
    input StudentInput {
        name: String!
        dob: String!
        gender: Gender!
        contact: String!
        email: String!
        fatherName: String!
        fatherContact: String!
        fatherEmail: String!
        motherName: String!
        motherContact: String!
        address: String!
        previousSchool: String!
        admissionDate: String!
        className: String!
        classSection: String!
        aadharNumber: String!
    }
    
    input StudentLoginInput {
        _id: ID!
        password: String!
    }
    input UpdateStudentClassInput {
        _id: ID!
        classID: ID!
    }
    input StudentUpdateInput {
        _id: ID!
        name: String
        dob: String
        gender: Gender
        contact: String
        email: String
        fatherName: String
        fatherContact: String
        fatherEmail: String
        motherName: String
        motherContact: String
        address: String
        previousSchool: String
        admissionDate: String
        classID: ID
    }
    input ChangePasswordInput {
        _id: ID!
        currentPassword: String!
        newPassword: String!
    }
    
`;

export default studentDef;