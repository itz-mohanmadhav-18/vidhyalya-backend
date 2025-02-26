import mongoose from "mongoose";

const ClassCodeSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    classTeacherID: {
        type: String,
        required: [true, 'Class Teacher is required'],
        trim: true,
        minlength: [8, 'Class Teacher ID must be 8 characters'],
        maxlength: [8, 'Class Teacher ID must be 8 characters']
    },
    studentRollNumbers: {
        type: [String], // Array of roll numbers
        validate: {
            validator: function (arr) {
                return arr.length > 0; // Ensures at least one student exists
            },
            message: 'At least one student is required'
        }
    },
    subjectTeachers: {
        type: Map,
        of: String, // Mapping subject names to teacher IDs
        required: true
    }
}, {
    _id: false
});

export default mongoose.model('ClassCode', ClassCodeSchema);
