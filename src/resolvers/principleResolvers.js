import Principle from '../models/Principle.js';
import GenerateIDsAndRolls from "./generateEmployeeIDsAndStudentNumbers.js";
import bcrypt from 'bcryptjs';
import logger from "../utils/logger.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from 'mongoose';
import {  
    principleSchema,
    principleInputSignInSchema,
    principleUpdateInputSchema
} from "../validations/principleInputValidation.js";
import {dirname, join} from "path";
import {fileURLToPath} from "url";
import {limitRequest} from "../utils/rateLimitter.js";
import {sanitizeInput} from "../utils/sanitizeInput.js";
import {
    ValidationError,
    AuthError,
    DuplicateEntryError,
    EmployeeNotFoundError,
    PermissionDeniedError,
    InvalidTokenError,
    AppError,
    InternalServerError,
    DatabaseQueryError
} from "../utils/errors.js"; // Adjust path if needed

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: join(__dirname, '../../.env')});

const ID = new GenerateIDsAndRolls();

const PrincipleResolvers = {
    Query: {
        principles: async (_, __, ctx) => {
            try {
                if (!ctx.isAuthenticated) {
                    throw new AuthError("Authentication required");
                }

                if (ctx.role !== 'admin' && ctx.role !== 'principle') {
                    throw new PermissionDeniedError("Access denied");
                }

                return await Principle.find({});
            } catch (error) {
                logger.error(`Error fetching principles: ${error.message}`);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new DatabaseQueryError(`Failed to fetch principles: ${error.message}`);
            }
        },

        principle: async (_, {_id}, ctx) => {
            try {
                if (!ctx.isAuthenticated) {
                    throw new AuthError("Authentication required");
                }

                // Allow principle to fetch only their own data or admin to fetch any
                // if (ctx.role === 'principle' && ctx.userID !== _id) {
                //     throw new PermissionDeniedError("Access denied");
                // }

                const principle = await Principle.findById(_id);
                if (!principle) {
                    throw new EmployeeNotFoundError(`Principle with ID ${_id} not found`);
                }

                return principle;
            } catch (error) {
                logger.error(`Error fetching principle ${_id}: ${error.message}`);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new DatabaseQueryError(`Failed to fetch principle: ${error.message}`);
            }
        },
    },

    Mutation: {
        addPrinciple: async (_, {input}, ctx) => {
            try {
                // Only admin can add a principle
                // if (ctx.isAuthenticated && ctx.role !== 'admin') {
                //     throw new PermissionDeniedError("Only administrators can add principles");
                // }

                input.email = input.email.toLowerCase();
                input = sanitizeInput(input);

                const {error} = principleSchema.validate(input);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }

                const user = await Principle.findOne({
                    $or: [{email: input.email}, {contact: input.contact}]
                });

                if (user) {
                    throw new DuplicateEntryError('User already exists with this email or contact');
                }

                const formattedDob = new Date(input.dob);
                const formattedDateOfJoining = new Date(input.dateOfJoining);

                if (isNaN(formattedDob.getTime()) || isNaN(formattedDateOfJoining.getTime())) {
                    throw new ValidationError('Invalid date format');
                }

                const salt_rounds = 12;
                const hashedPassword = await bcrypt.hash(input.password, salt_rounds);
                const id = await ID.generateEmployeeID('principle');

                const newPrinciple = new Principle({
                    ...input,
                    _id: id,
                    password: hashedPassword,
                    dob: formattedDob,
                    dateOfJoining: formattedDateOfJoining
                });

                await newPrinciple.save();

                logger.info(`Principle ${newPrinciple.name} added successfully by ${ctx.role} ${ctx.userID}`);
                return newPrinciple;
            } catch (error) {
                logger.error(`Error adding Principle: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to add principle: ${error.message}`);}

        },

        signInPrinciple: async (_, {input}) => {
            try {
                input = sanitizeInput(input);

                const {error} = principleInputSignInSchema.validate(input);
                if (error) {
                    logger.warn(`Invalid input format for EmployeeID: ${input.EmployeeID || 'unknown'}`);
                    throw new ValidationError(error.details[0].message);
                }

                const {_id, password} = input;

                try {
                    await limitRequest(_id); // limiting requests to 5 every 15 minutes
                } catch (limitError) {
                    throw new AuthError('Too many login attempts. Please try again later.');
                }

                const principle = await Principle.findById(_id);
                if (!principle) {
                    logger.warn(`Login failed - Invalid EmployeeID ${_id}`);
                    // Use generic message for security
                    throw new AuthError('Invalid credentials');
                }

                const isPasswordValid = await bcrypt.compare(password, principle.password);
                if (!isPasswordValid) {
                    logger.warn(`Login failed - Invalid Password for EmployeeID ${_id}`);
                    throw new AuthError('Invalid credentials');
                }

                // Generate JWT with appropriate payload
                const token = jwt.sign(
                    {
                        _id: principle._id,
                        role: 'principle'
                    },
                    process.env.JWT_SECRET,
                    {expiresIn: '1h', algorithm: 'HS256'}
                );

                logger.info(`✅ Successful login: ${_id}`);
                return {token};
            } catch (error) {
                logger.error(`❌ Login error for ${input._id || "Unknown ID"}: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new AuthError('Authentication failed');
            }
        },

        updatePrinciple: async (_, {input}, ctx) => {


            try {
                if (!ctx.isAuthenticated) {
                    throw new AuthError("Please login to continue");
                }

                let principleId;
                if (ctx.role === 'principle') {
                    principleId = ctx.userID; // A principle can update only their own profile
                } else if (ctx.role === 'admin') {
                    if (!input._id) {
                        throw new ValidationError("Admin must provide an _id to update a principle");
                    }
                    principleId = input._id; // Admin can update any principle's profile
                } else {
                    throw new PermissionDeniedError("Access Denied");
                }

                input = sanitizeInput(input);

                const {error} = principleUpdateInputSchema.validate(input);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }

                const {password, ...updatedFields} = input;

                const existingPrinciple = await Principle.findById(principleId);
                if (!existingPrinciple) {
                    throw new EmployeeNotFoundError("Principle not found");
                }

                if (password) {
                    updatedFields.password = await bcrypt.hash(password, 12);
                }

                // Handle date fields if present
                if (updatedFields.dob) {
                    const formattedDob = new Date(updatedFields.dob);
                    if (isNaN(formattedDob.getTime())) {
                        throw new ValidationError('Invalid date of birth format');
                    }
                    updatedFields.dob = formattedDob;
                }

                if (updatedFields.dateOfJoining) {
                    const formattedDateOfJoining = new Date(updatedFields.dateOfJoining);
                    if (isNaN(formattedDateOfJoining.getTime())) {
                        throw new ValidationError('Invalid date of joining format');
                    }
                    updatedFields.dateOfJoining = formattedDateOfJoining;
                }

                const updatedPrinciple = await Principle.findByIdAndUpdate(
                    principleId,
                    {...updatedFields},
                    {new: true, session}
                );

                if (!updatedPrinciple) {
                    throw new EmployeeNotFoundError("Error updating Principle");
                }

                logger.info(`✅ Principle ${updatedPrinciple.name} updated successfully by ${ctx.role} ${ctx.userID}`);
                return updatedPrinciple;
            } catch (error) {
                logger.error(`❌ Error updating Principle: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to update principle: ${error.message}`);
            }
        },

        deletePrinciple: async (_, {_id}, ctx) => {

            try {
                if (!ctx.isAuthenticated) {
                    throw new AuthError("Please login to continue");
                }

                if (ctx.role !== 'admin') {
                    throw new PermissionDeniedError('Only administrators can delete principles');
                }

                const principleToDelete = await Principle.findById(_id);
                if (!principleToDelete) {
                    throw new EmployeeNotFoundError(`Principle with ID ${_id} not found`);
                }

                const deletedPrinciple = await Principle.findByIdAndDelete(_id, { session });

                if (!deletedPrinciple) {
                    throw new DatabaseQueryError("Failed to delete principle");
                }
                logger.info(`✅ Principle ${deletedPrinciple.name} deleted successfully by ${ctx.role} ${ctx.userID}`);
                return deletedPrinciple;
            } catch (error) {
                logger.error(`❌ Error deleting Principle ${_id}: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to delete principle: ${error.message}`);
            }

        },
    },

    Principle: {
        dateOfJoining: (parent) => parent.dateOfJoining.toISOString(),
        dob: (parent) => parent.dob.toISOString(),
    }
};

export default PrincipleResolvers;