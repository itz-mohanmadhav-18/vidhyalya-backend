import Joi from "joi";

const principleSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    dob: Joi.string().isoDate().required(),  // ✅ Add dob with date format validation
    contact: Joi.string().pattern(/^[0-9]{10}$/).required(),
    email: Joi.string().email().required(),
    gender: Joi.string().valid("male", "female", "others").required(),
    Qualifications: Joi.array().items(Joi.string()).required(),
    Experience: Joi.number().integer().min(0).required(),
    dateOfJoining: Joi.string().isoDate().required(),  // ✅ Add dateOfJoining
    password: Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
        .min(8)
        .required()
});

const principleInputSignInSchema = Joi.object({
    _id: Joi.string().min(8).required(),
    password: Joi.string().min(8).required()
});

const principleUpdateInputSchema = Joi.object({
    _id: Joi.string().min(8),
    name: Joi.string().min(3).max(50),
    dob: Joi.string().isoDate(),
    contact: Joi.string().pattern(/^[0-9]{10}$/),
    email: Joi.string().email(),
    Qualifications: Joi.array().items(Joi.string()),
    Experience: Joi.number().integer().min(0),
    password: Joi.string().pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/)
        .min(8)
});

export { principleSchema, principleInputSignInSchema, principleUpdateInputSchema };