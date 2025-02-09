import PrincipleResolvers from "./principleResolvers.js";
import TeacherResolvers from "./teacherResolvers.js";

const resolvers = {
    Query: {
        ...PrincipleResolvers.Query,
        ...TeacherResolvers.Query
    },
    Mutation: {
        ...PrincipleResolvers.Mutation,
        ...TeacherResolvers.Mutation
    },
    Principle: {
        ...PrincipleResolvers.Principle,
    }
}

export default resolvers;