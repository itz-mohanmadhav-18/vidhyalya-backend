import mongoose from "mongoose";

const ClassesSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    schoolID: {
        type: String,
        required: [true, 'School ID is required'],
        trim: true,
    },
    classTeacherID: {
        type: String,
        // required: [true, 'Class Teacher is required'],
        trim: true,
        minlength: [8, 'Class Teacher ID must be 8 characters'],
        maxlength: [8, 'Class Teacher ID must be 8 characters']
    },
    enrolledStudents: {
        type: [String], // Array of student IDs
        default: [],
        // required: true,
        validate: {
            validator: function(arr) {
                return Array.isArray(arr); // Ensure it's an array
            },
            message: 'Enrolled students must be an array'
        }
    },
    subjectTeachers: [{
        subject: { type: String},
        teacherID: { type: String, ref: 'Teacher'}
    }],
    subjects: {
        type: [String],
        default:[],
    },
    studentsCount: {
        type: Number,
        default: 0
    },
}, {
    _id: false,
    timestamps: true, // Optional: adds createdAt and updatedAt fields
    toJSON: { virtuals: true }, // Enable virtual population
    toObject: { virtuals: true }
});

// Virtual fields for populating related data
ClassesSchema.virtual('classTeacher', {
    ref: 'Teacher',
    localField: 'classTeacherID',
    foreignField: '_id',
    justOne: true
});

ClassesSchema.virtual('students', {
    ref: 'Student',
    localField: 'enrolledStudents',
    foreignField: '_id',
    justOne: false
});

ClassesSchema.virtual('teacher', {
    ref: 'Teacher',
    localField: 'subjectTeachers',
    foreignField: '_id',
    justOne: false
});

export default mongoose.model('Classes', ClassesSchema);