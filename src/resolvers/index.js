import Principleresolvers from "./principleResolvers.js";
import Teacherresolvers from "./teacherResolvers.js";

const resolvers = {
    Query: {
        ...Principleresolvers.Query,
        ...Teacherresolvers.Query
    },
    Mutation: {
        ...Principleresolvers.Mutation,
        ...Teacherresolvers.Mutation
    },
    Principle: {
        ...Principleresolvers.Principle,
    }
}

export default resolvers;