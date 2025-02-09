import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    Principle_id: { type: String, required: true },
    Teacher_id: { type: String, required: true },
    Director_id: { type: String, required: true },
    Admin_id: { type: String, required: true },
});

const EmployeeId = mongoose.model('EmployeeId', EmployeeSchema);

export default EmployeeId;


