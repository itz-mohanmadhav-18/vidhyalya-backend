import PrincipleResolvers from "./principleResolvers.js";
import TeacherResolvers from "./teacherResolvers.js";
import StudentResolvers from "./studentResolvers.js";
import ClassResolvers from "./classResolvers.js";

const resolvers = {
    Query: {
        ...PrincipleResolvers.Query,
        ...TeacherResolvers.Query,
        ...StudentResolvers.Query,
        ...ClassResolvers.Query
    },
    Mutation: {
        ...PrincipleResolvers.Mutation,
        ...TeacherResolvers.Mutation,
        ...StudentResolvers.Mutation,
        ...ClassResolvers.Mutation
    },
    Principle: {
        ...PrincipleResolvers.Principle,
    },
    Class:{
        ...ClassResolvers.Class,
    }
}

export default resolvers;