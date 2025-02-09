import mongoose from "mongoose";

const studentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age:{
        type:Number,
        required:true
    },
    standard:{
        type: String,
        required: true,
    },
    subjects:{
        type: [String],
        required: true,
    },
    dateOfEnrollment:{
        type:Date,
        default:Date.now
    }

});
const Student = mongoose.model('Student', studentSchema);
module.exports = {Student};
