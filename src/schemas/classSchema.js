import { gql } from 'graphql-tag'

const classDef = gql`
    type Class {
        _id: ID!
        schoolID: ID!
        classTeacherID: ID!
        enrolledStudents: [ID!]!
        subjectsWithTeachers: [SubjectTeacher!]!
        classTeacher: Teacher
        studentsCount: Int!
        subjects: [String!]
    }
    type SubjectTeacher {
        subject: String!
        teacher: Teacher!
    }
    input CreateClassInput {
        schoolID: ID!
        className: String!
        classSection: String!
        classTeacherID: ID
        enrolledStudents: [ID]
        subjectTeachers: [SubjectTeacherInput]
        subjects: [String]
        
    }
    input SubjectTeacherInput {
        Subject: String!
        Teacher: ID! 
    }

    input UpdateClassInput {
        schoolID: ID
        classTeacherID: ID
        enrolledStudents: [ID!]
        subjectTeachers: [SubjectTeacherInput]
    }

    extend type Query {
        class(id: ID!): Class
        classesBySchool(schoolID: ID!): [Class!]!
        classesByTeacher(teacherID: ID!): [Class!]!
    }

    extend type Mutation {
        createClass(input: CreateClassInput!): Class!
        updateClass(id: ID!, input: UpdateClassInput!): Class!
        deleteClass(id: ID!): Boolean!
        addStudentToClass(classID: ID!, studentID: ID!): Class!
        removeStudentFromClass(classID: ID!, studentID: ID!): Class!
        addClassTeacher(classID: ID!, teacherID: ID!): Class!
        addSubjectsToClass(classID: ID!, subjects: [String!]!): Class!
        assignSubjectTeacher(classID: ID!, subject: String!, teacherID: ID!): Class!
    }
`

export default classDef;