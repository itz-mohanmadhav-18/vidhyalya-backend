import teacher from "../models/Teacher.js"

const TeacherResolvers = {
    Query: {
        teachers: async () => {
            return await teacher.find();
        },
        teacher: async (_, { id }) => {
            return await teacher.findById(id);
        }
    },
    Mutation: {
        addTeacher: async (_, { input }) => {
            return await teacher.create(input);
        },
        updateTeacher: async (_, { input }) => {
            const { id, ...update } = input;
            return await teacher.findByIdAndUpdate(id, update, { new: true });
        },
        deleteTeacher: async (_, { id }) => {
            return await teacher.findByIdAndRemove(id);
        }
    }
}

export default TeacherResolvers;
