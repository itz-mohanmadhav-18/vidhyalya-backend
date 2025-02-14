import Joi from "joi";

const PrincipleInputSignInSchema = Joi.object({
    EmployeeID: Joi.string().min(8).required(),
    password: Joi.string().min(8).required()
})

export default PrincipleInputSignInSchema;