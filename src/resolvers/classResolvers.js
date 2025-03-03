import Classes from '../models/classes.js'
import Teacher from '../models/Teacher.js'
import mongoose from 'mongoose'
import logger from "../utils/logger.js";

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

const classResolvers = {

    // Query: {
    //     classByID: async (_, {id}, ctx) => {
    //         try {
    //             logger.info(`Fetching class with ID: ${id}`);
    //             return await Classes.findById(id);
    //         } catch (e) {
    //             logger.error(e);
    //             return null;
    //         }
    //     },
    //     classesBySchool: async (_, {schoolID}, ctx) => {
    //         try {
    //             logger.info(`Fetching classes for school with ID: ${schoolID}`);
    //             return await Classes.find({schoolID: schoolID});
    //         } catch (e) {
    //             logger.error(e);
    //             return null;
    //         }
    //     },
    //     classesByTeacher: async (_, {teacherID}, ctx) => {
    //         try {
    //             logger.info(`Fetching classes for teacher with ID: ${teacherID}`);
    //             return await Classes.find({
    //                 $or: [
    //                     {classTeacherID: teacherID},
    //                     {'subjectTeachers.teacherID': teacherID}
    //                 ]
    //             });
    //
    //         } catch (e) {
    //             logger.error(e);
    //             return null;
    //         }
    //     }
    // },
    Class: {
        classTeacher: async (parent) => {
            try{
                return await Teacher.findById(parent.classTeacherID);
            }catch (e){
                logger.error(e);
                return null;
            }
        },
        studentsCount: async (parent) => {
            return parent.enrolledStudents.length;
        },
        subjectsWithTeachers: async (parent) => {
            let subjectTeachers = [];
            for (let i = 0; i < parent.subjectTeachers.length; i++) {
                let teacher = await Teacher.findById(parent.subjectTeachers[i].teacherID);
                subjectTeachers.push({
                    subject: parent.subjectTeachers[i].subject,
                    teacher
                });
            }
            return subjectTeachers;

        },
    },
        Mutation: {
            createClass: async (_, { input }, ctx) => {
                try {
                    const classID = await generateClassCode(input.className, input.classSection);

                    // Correct way to create a new document
                    const newClass = new Classes({ ...input, _id: classID });

                    return await newClass.save();
                } catch (error) {
                    console.error("Error creating class:", error);
                    throw new Error("Failed to create class");
                }
            },
            updateClass: async (_, {id, input}, ctx) => {
                return await Classes.findByIdAndUpdate(id, input, {new: true});
            },

        }
}

export default classResolvers;