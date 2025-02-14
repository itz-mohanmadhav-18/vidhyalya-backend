import Principle from '../models/Principle.js';
import GenerateIDsAndRolls from "./generateEmployeeIDsAndStudentNumbers.js";
import bcrypt from 'bcryptjs';
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import principleSchema from "../validations/principleInputValidation.js"
import {dirname, join} from "path";
import {fileURLToPath} from "url";
import PrincipleInputSignInSchema from '../validations/principleInputSignIn.js'
import {limitRequest} from "../utils/rateLimitter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../config.env') });

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
                try{
                    //validate input
                    const {error} = PrincipleInputSignInSchema.validate(input);
                    if(error){
                        logger.warn(`Invalid input format for EmployeeID: ${input.EmployeeID}`)
                        throw new Error(error.details[0].message)
                    }

                    const { EmployeeID, password } = input;
                    await limitRequest(EmployeeID); // limiting requests to 5 every 15 minutes
                    //check if entry exists in database
                    const principle = await Principle.findOne({ EmployeeID });
                    if (!principle) {
                        logger.warn(`login failed - Invalid Employeeid ${EmployeeID}`);
                        throw new Error('Invalid credentials');
                    }
                    // secure password comparison
                    const isPasswordValid = await bcrypt.compare(password,principle.password);
                    if (!isPasswordValid) {
                        logger.warn(`login failed - Invalid Password for EmployeeID ${EmployeeID}`)
                        throw new Error('Invalid credentials');
                    }

                    const token = jwt.sign(
                        { EmployeeID },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h',algorithm:'HS256' }
                    );
                    logger.info(`✅ Successful login: ${EmployeeID}`);
                    return { token };
                }catch (error){
                    logger.error(`❌ Login error for ${input.EmployeeID || "Unknown ID"}: ${error.message}`);
                    throw new Error(error.message);
                }
        },
        updatePrinciple: async (_, { input },ctx) => {
            if(!ctx.isAuthenticated){
                throw new Error("login to continue");
            }
            if(ctx.role !== 'principle'||ctx.role !== 'admin'){
                throw new Error('Access Denied');
            }

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