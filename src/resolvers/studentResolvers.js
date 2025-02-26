import GenerateIDsAndRolls from "./generateEmployeeIDsAndStudentNumbers.js";
import bcrypt from 'bcryptjs';
import logger from "../utils/logger.js";
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
    DatabaseQueryError
} from "../utils/errors.js";
import Student from "../models/Student.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({path: join(__dirname, '../../config.env')});

const ID = new GenerateIDsAndRolls();
const generateClassCode= async (schoolCode,classGrade, classSection)=> {
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
    if (!classCodes[classGrade]) {
        throw new Error('Invalid class grade');
    }
    return `${schoolCode}${classCodes[classGrade]}${classSection}`;
}

const studentResolvers = {
    Query:{
        allStudents: async (parent, args, context) => {

        }
    },
    resolvers:{

    }
}