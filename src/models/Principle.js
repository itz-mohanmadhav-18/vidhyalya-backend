import mongoose from 'mongoose';

// Define Schema
const PrincipleSchema = new mongoose.Schema({
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
        unique: true,
        match: [/^\d{10}$/, 'Contact number must be exactly 10 digits']
    },

    gender: {
        type: String,
        enum: ['male', 'female', 'others'],
        required: [true, 'Gender is required']
    },

    Qualifications: [{
        type: String,
        required: [true, 'At least one qualification is required'],
        validate: {
            validator: function(value) {
                return value.length > 0;
            },
            message: 'Qualifications array cannot be empty'
        }
    }],

    Experience: {
        type: Number,
        required: [true, 'Experience is required'],
        min: [0, 'Experience cannot be negative'],
        max: [50, 'Experience cannot exceed 50 years']
    },

    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Invalid email format']
    },

    dateOfJoining: {
        type: Date,
        default: Date.now
    },
    password:{
        type:String,
        required:true
    }
},{
    _id: false
});

// Create Model
const Principle = mongoose.model('Principle', PrincipleSchema);

export default Principle;
