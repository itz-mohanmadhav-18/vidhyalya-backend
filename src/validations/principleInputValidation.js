import Joi from "joi";

const principleSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    dob: Joi.string().isoDate().required(),  // ✅ Add dob with date format validation
    contact: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid("male", "female", "other").required(),
    Qualifications: Joi.array().items(Joi.string()).required(),
    Experience: Joi.number().integer().min(0).required(),
    dateOfJoining: Joi.string().isoDate().required(),  // ✅ Add dateOfJoining
    password: Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
        .min(8)
        .required()
});

export default principleSchema;