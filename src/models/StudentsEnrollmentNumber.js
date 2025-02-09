import mongoose from "mongoose";

const StudentIdSequenceSchema = new mongoose.Schema({
    classCode: { type: String, required: true, unique: true },
    lastStudentID: { type: String, required: true }
});

const StudentIdSequence = mongoose.model('StudentIdSequence', StudentIdSequenceSchema);
export default StudentIdSequence;