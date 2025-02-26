import jwt from "jsonwebtoken";
import GenerateIDsAndRolls from "./resolvers/generateEmployeeIDsAndStudentNumbers.js";
import logger from "./utils/logger.js";
import {
    AuthError,
    InvalidUserIDError,
    InvalidTokenError
} from "./utils/errors.js";

const roleMapping = Object.fromEntries(
    Object.entries(GenerateIDsAndRolls.roleCodes)
        .map(([key, value]) => [value, key]));

const studentClassCodes = new Set(Object.values(GenerateIDsAndRolls.classCodes));


const context = async ({req}) => {
    const token = req.headers.authorization || '';
    if (!token) {
        return {isAuthenticated: false, role: "unknown", userID: null};
    }else{
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userID = decoded.StudentID|| decoded._id;
            if (!userID || userID.length < 8) {
                throw new InvalidUserIDError();
            }
            let role = "unknown";

            if (userID.length === 10) {
                const classCode = userID.substring(2, 4); // Extract 3rd & 4th digits
                if (studentClassCodes.has(classCode)) {
                    role = "student";
                } else {
                    logger.error(`Invalid Student ID: ${userID}`);
                    throw new InvalidUserIDError("Invalid Student ID format");
                }
            } else if (userID.length === 8) {
                const roleCode = userID.substring(2, 4);
                if (roleMapping[roleCode]) {
                    role = roleMapping[roleCode];
                } else {
                    logger.error(`Invalid Employee ID: ${userID}`);
                    throw new InvalidUserIDError("Invalid Employee ID format");
                }
            }
            logger.info(`User ${userID} authenticated as ${role}`);
            return {userID, role, isAuthenticated: true};

        } catch (e) {
            if(e instanceof jwt.JsonWebTokenError){
                logger.error(`Invalid token: ${e.message}`);
                throw new InvalidTokenError();
            }
            logger.error(`Error verifying token: ${e.message}`);
            throw new AuthError("Authentication failed");
        }
    }

}

export default context;
