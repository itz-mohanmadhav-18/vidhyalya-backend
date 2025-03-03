import Joi from "joi";

const studentSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    password: Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
        .min(8),
    gender: Joi.string().valid("male", "female", "others").required(),
    dob: Joi.string().isoDate().required(),
    contact: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email(),
    fatherName: Joi.string().min(3).max(50).required(),
    fatherContact: Joi.string().pattern(/^[0-9]{10}$/).required(),
    fatherEmail: Joi.string().email(),
    motherName: Joi.string().min(3).max(50).required(),
    motherContact: Joi.string().pattern(/^[0-9]{10}$/).required(),
    address: Joi.string().min(3).max(50).required(),
    previousSchool: Joi.string().min(3).max(50).required(),
    admissionDate: Joi.string().isoDate(),
    className:Joi.string().required(),
    classSection:Joi.string().required(),
    aadharNumber: Joi.string().required().min(12).max(12)
});

const studentLoginSchema = Joi.object({
    _id: Joi.string().required(),
    password: Joi.string().min(8).required()
});

const studentUpdateSchema = Joi.object({
    _id: Joi.string().required(),
    name: Joi.string().min(3).max(50),
    gender: Joi.string().valid("male", "female", "others"),
    dob: Joi.string().isoDate(),
    contact: Joi.string().pattern(/^[0-9]{10}$/),
    email: Joi.string().email(),
    fatherName: Joi.string().min(3).max(50),
    fatherContact: Joi.string().pattern(/^[0-9]{10}$/),
    fatherEmail: Joi.string().email(),
    motherName: Joi.string().min(3).max(50),
    motherContact: Joi.string().pattern(/^[0-9]{10}$/),
    address: Joi.string().min(3).max(50),
    previousSchool: Joi.string().min(3).max(50),
    admissionDate: Joi.string().isoDate(),
    classID: Joi.string()
});

const updateStudentClassSchema = Joi.object({
    _id: Joi.string().required(),
    classID: Joi.string().required()
});

const changePasswordSchema = Joi.object({
    _id: Joi.string().required(),
    currentPassword: Joi.string().min(8).required(),
    newPassword: Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
        .min(8)
        .required()
});

export {
    studentSchema,
    studentLoginSchema,
    studentUpdateSchema,
    updateStudentClassSchema,
    changePasswordSchema
};