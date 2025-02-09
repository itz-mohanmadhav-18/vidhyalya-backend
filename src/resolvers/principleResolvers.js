import Principle from '../models/Principle.js';
import GenerateIDsAndRolls from "./generateEmployeeIDsAndStudentNumbers.js";
import bcrypt from 'bcryptjs';
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import principleSchema from "../validations/principleInputValidation.js"
dotenv.config();

const ID = new GenerateIDsAndRolls();

const PrincipleResolvers = {
    Query: {
        principles: async () => await Principle.find({}),
        principle: async (_, {EmployeeID}) => await Principle.findOne({EmployeeID}, (err, doc) => {
            if (err) {
                throw new Error('Employee not found');
            }
            return doc;
        }),
    },
    Mutation: {
        addPrinciple: async (_, { input }) => {
            // const session = await mongoose.startSession();
            // session.startTransaction();
            try{
                input.email = input.email.toLowerCase();
                const { error } = principleSchema.validate(input);
                if (error) {
                    throw new Error(error.details[0].message);
                }
                const user = await Principle.findOne({
                    $or:  [{ email: input.email }, { contact: input.contact }]
                });
                if (user) {
                    throw new Error('User already exists');
                }
                const formattedDob = new Date(input.dob);
                const formattedDateOfJoining = new Date(input.dateOfJoining);
                const salt_rounds = 12;
                const hashedPassword = await bcrypt.hash(input.password, salt_rounds);
                const id = await ID.generateEmployeeID('principle');
                const newPrinciple = new Principle({
                    ...input,
                    EmployeeID: id,
                    password: hashedPassword,
                    Dob: formattedDob,
                    dateOfJoining: formattedDateOfJoining
                });
                await newPrinciple.save();
                // await session.commitTransaction();
                logger.info(`Principle ${newPrinciple.name} added successfully`);
                return newPrinciple;
            }
            catch (e) {
                // await session.abortTransaction();
                logger.error(`Error adding Principle: ${e.message}`);
                throw new Error(`Transaction aborted: ${e.message}`);
            }
            finally {
                // await session.endSession();
            }
        },
        signInPrinciple: async (_, { input }) => {
                const { EmployeeID, password } = input;
                const principle = await Principle.findOne({ EmployeeID });
                if (!principle) {
                    throw new Error('Invalid credentials');
                }
                const isPasswordValid = await bcrypt.compare(password, principle.password);
                if (!isPasswordValid) {
                    throw new Error('Invalid credentials');
                }
                const token = jwt.sign({ EmployeeID }, process.env.JWT_SECRET, { expiresIn: '1d' });
                return { token };
        },


        updatePrinciple: async (_, { input }) => {
            const updatedPrinciple = await Principle.findByIdAndUpdate(id,
                { ...input },
                { new: true });
            return updatedPrinciple;
        },
        deletePrinciple: async (_, { _id }) => {
            const deletedPrinciple = await Principle.findByIdAndDelete(id);
            return deletedPrinciple;
        },
    },
    Principle: {
        dateOfJoining: (parent) => parent.dateOfJoining.toISOString(),
    }
};

export default PrincipleResolvers;