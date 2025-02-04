// resolvers/principleResolvers.js
import Principle from '../models/Principle.js';

const Principleresolvers = {
    Query: {
        principles: async () => await Principle.find({}),
        principle: async (_, { id }) => await Principle.findById(id),
    },
    Mutation: {
        addPrinciple: async (_, {input}) => {
            const newPrinciple = new Principle( input);
            await newPrinciple.save();
            return newPrinciple;
        },
        updatePrinciple: async (_, { input }) => {
            const updatedPrinciple = await Principle.findByIdAndUpdate(id,
                { ...input },
                { new: true });
            return updatedPrinciple;
        },
        deletePrinciple: async (_, { id }) => {
            const deletedPrinciple = await Principle.findByIdAndDelete(id);
            return deletedPrinciple;
        },
    },
    Principle: {
        dateOfJoining: (parent) => parent.dateOfJoining.toISOString(),
    }
};

export default Principleresolvers;