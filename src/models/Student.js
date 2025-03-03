import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({

    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [3, 'Name must be at least 3 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    gender: {
        type: String,
        enum: ['male','female','others'],
        required: [true, 'Gender is required']
    },
    dob: {
        type: Date,
        required: [true, 'Date of Birth is required'],
        validate: {
            validator: function(value) {
                return value < new Date(); // Must be a past date
            },
            message: 'Date of Birth must be in the past'
        }
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required'],
        match: [/^\d{10}$/, 'Contact number must be exactly 10 digits']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/\S+@\S+\.\S+/, 'Invalid Email format'],
    },
    fatherName: {
        type: String,
        required: [true, 'Father Name is required'],
        trim: true,
        minlength: [3, 'Father Name must be at least 3 characters'],
        maxlength: [50, 'Father Name cannot exceed 50 characters']
    },
    fatherContact: {
        type: String,
        required: [true, 'Father Contact number is required'],
        match: [/^\d{10}$/, 'Father Contact number must be exactly 10 digits']
    },
    fatherEmail: {
        type: String,
        required: [true, 'Father Email is required'],
        match: [/\S+@\S+\.\S+/, 'Invalid Email format'],
    },
    motherName: {
        type: String,
        required: [true, 'Mother Name is required'],
        trim: true,
        minlength: [3, 'Mother Name must be at least 3 characters'],
        maxlength: [50, 'Mother Name cannot exceed 50 characters']
    },
    motherContact: {
        type: String,
        required: [true, 'Mother Contact number is required'],
        match: [/^\d{10}$/, 'Mother Contact number must be exactly 10 digits']
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
        trim: true,
        minlength: [3, 'Address must be at least 3 characters'],
        maxlength: [50, 'Address cannot exceed 50 characters']
    },
    previousSchool: {
        type: String,
        required: [true, 'Previous School is required'],
        trim: true,
        minlength: [3, 'Previous School must be at least 3 characters'],
        maxlength: [50, 'Previous School cannot exceed 50 characters']
    },
    admissionDate: {
        type: Date,
        required: [true, 'Admission Date is required'],
        validate: {
            validator: function(value) {
                return value < new Date(); // Must be a past date
            },
            message: 'Admission Date must be in the past'
        }},
    classID: {
        type: String,
        required: [true, 'Class Code is required'],
        trim: true,
        ref: 'Classes'
    },
    aadharNumber: {
        type: String,
        required: [true, 'Aadhar Number is required'],
        match: [/^\d{12}$/, 'Aadhar Number must be exactly 12 digits']
    }

});

export default mongoose.model('Student', StudentSchema);