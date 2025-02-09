import EmployeeId from "../models/EmployeeId.js";
import StudentIdSequence from "../models/StudentsEnrollmentNumber.js";

class GenerateIDsAndRolls {

  static roleCodes = {
    'director': '01',
    'admin':'02',
    'principle':'03',
    'teacher':'04',
  };
  static classCodes = {
    'nursery':'01',
    'lkg':'02',
    'ukg':'03',
    'first':'04',
    'second':'05',
    'third':'06',
    'fourth':'07',
    'fifth':'08',
    'sixth':'09',
    'seventh':'10',
    'eighth':'11',
    'ninth':'12',
    'tenth':'13',
    'eleventh':'14',
    'twelfth':'15',
  }
    async getYear() {
        let date = new Date();
        return date.getFullYear() % 100; // Get last two digits of the year
    }

    async ensureDocument() {
        let doc = await EmployeeId.findOne();
        const currentYear = await this.getYear();

        if (!doc) {
            // If no document exists, create a new one for the current year
            doc = new EmployeeId({
                Principle_id: `${currentYear}${this.constructor.roleCodes['principle']}0001`,
                Teacher_id: `${currentYear}${this.constructor.roleCodes['teacher']}0001`,
                Director_id: `${currentYear}${this.constructor.roleCodes['director']}0001`,
                Admin_id: `${currentYear}${this.constructor.roleCodes['admin']}0001`,
            });
            await doc.save();
        } else {
            // Check if the year in the document matches the current year
            const docYear = parseInt(doc.Principle_id.slice(0, 2), 10); // Extract the year from an existing ID
            if (docYear !== currentYear) {
                // Reset all IDs for the new year
                doc.Principle_id = `${currentYear}${this.constructor.roleCodes['principle']}0001`;
                doc.Teacher_id = `${currentYear}${this.constructor.roleCodes['teacher']}0001`;
                doc.Director_id = `${currentYear}${this.constructor.roleCodes['director']}0001`;
                doc.Admin_id = `${currentYear}${this.constructor.roleCodes['admin']}0001`;
                await doc.save();
            }
        }

        return doc;
    }

    async generateEmployeeID(role) {
        let employeeID;
        const year = await this.getYear(); // Current year
        const roleCode = this.constructor.roleCodes[role];

        if (!roleCode) {
            throw new Error('Invalid role');
        }

        const doc = await this.ensureDocument(); // Ensure document is up-to-date
        let lastID;

        // Get the last ID for the given role
        switch (role) {
            case 'principle':
                lastID = doc.Principle_id;
                break;
            case 'teacher':
                lastID = doc.Teacher_id;
                break;
            case 'director':
                lastID = doc.Director_id;
                break;
            case 'admin':
                lastID = doc.Admin_id;
                break;
            default:
                throw new Error('Invalid role');
        }

        // Parse the sequence and increment it
        let sequence = parseInt(lastID.slice(-4), 10); // Extract the last 4 digits (sequence number)
        let newSequence = (sequence + 1).toString().padStart(4, '0'); // Increment and pad with zeros

        // Generate the new employee ID
        employeeID = `${year}${roleCode}${newSequence}`;

        // Update the appropriate field in the document
        const updateQuery = {};
        switch (role) {
            case 'principle':
                updateQuery.Principle_id = employeeID;
                break;
            case 'teacher':
                updateQuery.Teacher_id = employeeID;
                break;
            case 'director':
                updateQuery.Director_id = employeeID;
                break;
            case 'admin':
                updateQuery.Admin_id = employeeID;
                break;
            default:
                throw new Error('Invalid role');
        }

        // Update the database with the new ID
        await EmployeeId.findByIdAndUpdate(doc._id, updateQuery);

        return employeeID;
    }

    async generateStudentID(className) {
        const year = await this.getYear(); // Get the current year (last two digits)
        const classCode = this.constructor.classCodes[className];

        if (!classCode) {
            throw new Error('Invalid class name');
        }

        // Find or create a sequence document for the class
        let sequenceDoc = await StudentIdSequence.findOne({ classCode });

        if (!sequenceDoc) {
            sequenceDoc = new StudentIdSequence({
                classCode,
                lastStudentID: `${year}${classCode}000000`
            });
        }

        // Increment the sequence
        const sequence = parseInt(sequenceDoc.lastStudentID.slice(-6), 10);
        const newSequence = (sequence + 1).toString().padStart(6, '0');

        // Generate the new student ID
        const studentID = `${year}${classCode}${newSequence}`;

        // Update the sequence in the database
        sequenceDoc.lastStudentID = studentID;
        await sequenceDoc.save();

        return studentID;
    }



}
export default GenerateIDsAndRolls;
