import GenerateIDsAndRolls from "./generateEmployeeIDsAndStudentNumbers.js";
import bcrypt from 'bcryptjs';
import logger from "../utils/logger.js";
import {
    studentSchema,
    studentLoginSchema,
    studentUpdateSchema,
    updateStudentClassSchema,
    changePasswordSchema
} from "../validations/studentInputValidationSchema.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from 'mongoose';
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
    DatabaseQueryError,
    StudentNotFoundError
} from "../utils/errors.js";
import Student from "../models/Student.js";
import Classes from "../models/classes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: join(__dirname, '../../.env')});

const ID = new GenerateIDsAndRolls();//Instance of GenerateIDsAndRolls class

const generateClassCode = async (className, classSection) => {
    let classCodes = {
        'nursery': '01',
        'lkg': '02',
        'ukg': '03',
        'first': '04',
        'second': '05',
        'third': '06',
        'fourth': '07',
        'fifth': '08',
        'sixth': '09',
        'seventh': '10',
        'eighth': '11',
        'ninth': '12',
        'tenth': '13',
        'eleventh': '14',
        'twelfth': '15',
    };
    if (!classCodes[className]) {
        throw new Error('Invalid class grade');
    }
    return `${classCodes[className]}${classSection}`;
}

const studentResolvers = {
    Query: {
        studentByID: async (_, { _id }, ctx) => {
            try{
                if(!ctx.isAuthenticated){
                    throw new AuthError("Authentication required")
                }
                if (ctx.role !== 'admin' && ctx.role !== 'principle') {
                    throw new PermissionDeniedError("Access denied");
                }
                //todo : Student can view its profile only
                _id = sanitizeInput(_id);
                const student = Student.findById(_id); 
                if(!student){
                    throw new StudentNotFoundError(`Student with ID ${_id} not found`)
                }
                return student;
            }
            catch (error) {
                logger.error(`Error fetching student ${_id}: ${error.message}`);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new DatabaseQueryError(`Failed to fetch student: ${error.message}`);
            }
        },
        students: async (_, __, ctx) => {
            try{
                if(!ctx.isAuthenticated){
                    throw new AuthError("Authentication Required")
                }
                if (ctx.role !== 'admin' && ctx.role !== 'principle') {
                    throw new PermissionDeniedError("Access denied");
                }
                // add logger.info
                return await Student.find();
            }
            catch(error){
                logger.error(`Error fetching students: ${error.message}`);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new DatabaseQueryError(`Failed to fetch students: ${error.message}`);
            }
        },
        studentsByClass: async (_, { classID }, ctx) => {
            try{
                if(!ctx.isAuthenticated){
                    throw new AuthError("Authentication Required")
                }
                if (ctx.role !== 'admin' && ctx.role !== 'principle' && ctx.role !== 'teacher') {
                    throw new PermissionDeniedError("Access denied");
                }
                classID = sanitizeInput(classID);
                //class schema has array of students ids so use that to increase efficiency
                return await Student.find({classID: classID});
            }
            catch(error){
                logger.error(`Error fetching students by class ${classID}: ${error.message}`);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new DatabaseQueryError(`Failed to fetch students by classID: ${error.message}`);
            }
        },
        studentsByAdmissionDate: async (_, { admissionDate }, ctx) => {
            try{
                if(!ctx.isAuthenticated){
                    throw new AuthError("Authentication Required");
                }
                if (ctx.role !== 'admin' && ctx.role !== 'principle') {
                    throw new PermissionDeniedError("Access denied");
                }
                admissionDate = sanitizeInput(admissionDate);
                const formattedAdmissionDate = new Date(admissionDate);
                if (isNaN(formattedAdmissionDate.getTime())) {
                    throw new ValidationError("Invalid admission date format");
                }
                return await Student.find({ admissionDate: formattedAdmissionDate });
            }catch(error){
                logger.error(`Error fetching students by admission date: ${error.message}`);
                if (error instanceof AppError) {
                    throw error;
                }
                throw new DatabaseQueryError(`Failed to fetch students by admission Date: ${error.message}`);
            }
        },//studentsByAge
    },
    Mutation: {
        addStudent: async (_, {input}, ctx) => {
            try {
                // Only admin can add a principle
                if (ctx.isAuthenticated && ctx.role !== 'admin') {
                    throw new PermissionDeniedError("Only administrators can add principles");
                }

                //sanitise and standardize input
                input.email = input.email.toLowerCase();
                input.fatherEmail = input.fatherEmail.toLowerCase();
                input = sanitizeInput(input);

                //validate Input
                const {error} = studentSchema.validate(input);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }
                //check if student already exists
                const existingStudent = await Student.findOne({
                    aadharNumber: input.aadharNumber,
                });


                if (existingStudent) {
                    throw new DuplicateEntryError('Student already exists with this aadhar Card number');
                }

                //format date
                const formattedDob = new Date(input.dob);
                const formattedAdmissionDate = new Date(input.admissionDate);

                if (isNaN(formattedDob.getTime()) || isNaN(formattedAdmissionDate.getTime())) {
                    throw new ValidationError('Invalid date format');
                }

                //verify class exists
                const classID = await generateClassCode(input.className, input.classSection);
                const classExists = await Classes.findOne({_id: classID});
                if (!classExists) {
                    throw new DatabaseQueryError('Class does not exist');
                }

                //Generate student ID and hash password
                const salt_rounds = 12;
                const hashedPassword = await bcrypt.hash(input.dob, salt_rounds);
                const id = await ID.generateStudentID(input.className);


                const newStudent = new Student({
                    ...input,
                    _id: id,
                    password: hashedPassword,
                    dob: formattedDob,
                    classID: classID,
                    admissionDate: formattedAdmissionDate,
                });

                await newStudent.save();

                try {
                    await Classes.findByIdAndUpdate(
                        classID, {
                            $push: {enrolledStudents: id},
                            $inc: {studentsCount: 1}
                        }, {new: true});

                    logger.info(`Student ${newStudent.name} added successfully by ${ctx.role} ${ctx.userID}`);
                    return newStudent;
                } catch (error) {
                    try {
                        await Student.findByIdAndDelete(id);
                    } catch (rollbackError) {
                        logger.error(`Failed to rollback student creation after class update failed: ${rollbackError.message}`);
                    }
                    throw error;
                }
            } catch (error) {
                logger.error(`Error adding Student: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to add Student: ${error.message}`);
            }

        },
        updateStudent: async (_, {input}, ctx) => {
            try {
                // Only admin can update a student
                if (ctx.isAuthenticated && ctx.role !== 'admin') {
                    throw new PermissionDeniedError("Only administrators can update students");
                }

                //sanitise and standardize input
                if(input.email)
                input.email = input.email.toLowerCase();

                if(input.fatherEmail)
                input.fatherEmail = input.fatherEmail.toLowerCase();

                input = sanitizeInput(input);

                //validate Input
                const {error} = studentUpdateSchema.validate(input);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }

                //check if student exists
                const existingStudent = await Student.findById(input._id);
                if (!existingStudent) {
                    throw new EmployeeNotFoundError('Student not found');
                }

                //format date
                const formattedDob = new Date(input.dob);
                const formattedAdmissionDate = new Date(input.admissionDate);

                if (isNaN(formattedDob.getTime()) || isNaN(formattedAdmissionDate.getTime())) {
                    throw new ValidationError('Invalid date format');
                }

                //verify class exists
                const classID = await generateClassCode(input.className, input.classSection);
                const classExists = await Classes.findOne({_id: classID});
                if (!classExists) {
                    throw new DatabaseQueryError('Class does not exist');
                }

                //update student
                const updatedStudent = await Student.findByIdAndUpdate(input._id, {
                    ...input,
                    dob: formattedDob,
                    admissionDate: formattedAdmissionDate,
                    classID: classID
                }, {new: true});

                logger.info(`Student ${updatedStudent.name} updated successfully by ${ctx.role} ${ctx.userID}`);
                return updatedStudent;

            } catch (error) {
                logger.error(`Error updating Student: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to update Student: ${error.message}`);
            }
        },
        loginStudent: async (_, {input}, ctx) => {
            try {
                //sanitise and standardize input
                input._id = input._id.toLowerCase();
                input = sanitizeInput(input);

                //validate Input
                const {error} = studentLoginSchema.validate(input);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }

                //check if student exists
                const existingStudent = await Student.findById(input._id);
                if (!existingStudent) {
                    throw new EmployeeNotFoundError('Student not found');
                }

                //verify password
                const isPasswordValid = await bcrypt.compare(input.password, existingStudent.password);
                if (!isPasswordValid) {
                    throw new AuthError('Invalid credentials');
                }

                //generate token
                const token = jwt.sign({
                    _id: existingStudent._id,
                    role: 'student'
                }, process.env.JWT_SECRET, {expiresIn: '1h'});

                logger.info(`Student ${existingStudent.name} logged in successfully`);
                return {token};

            } catch (error) {
                logger.error(`Error logging in Student: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to login Student: ${error.message}`);
            }

        },
        deleteStudent: async (_, {id}, ctx) => {
            try {
                // Only admin can delete a student
                if (ctx.isAuthenticated && ctx.role !== 'admin') {
                    throw new PermissionDeniedError("Only administrators can delete students");
                }

                //check if student exists
                const existingStudent = await Student.findById(id);
                if (!existingStudent) {
                    throw new EmployeeNotFoundError('Student not found');
                }

                //delete student
                await Student.findByIdAndDelete(id);
                await Classes.findByIdAndUpdate(
                    existingStudent.classID, {
                        $pull: {enrolledStudents: id},
                        $inc: {studentsCount: -1}
                    });

                logger.info(`Student ${existingStudent.name} deleted successfully by ${ctx.role} ${ctx.userID}`);
                return existingStudent;

            } catch (error) {
                logger.error(`Error deleting Student: ${error.message}`);

                if (error instanceof AppError) {
                    throw error;
                }

                throw new InternalServerError(`Failed to delete Student: ${error.message}`);
            }


        },


    },
    Student: {
        class: async (parent) => {
            try {
                return await Classes.findById(parent.classID);
            } catch (e) {
                logger.error(e);
                return null;
            }
        }
    }
}

export default studentResolvers;