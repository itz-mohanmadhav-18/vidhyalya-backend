import mongoose from 'mongoose';
const TeacherSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age:{
        type:Number,
        required:true
    },
    dateOfJoining:{
        type:Date,
        default:Date.now
    }

});

const Teacher = mongoose.model('Teacher', TeacherSchema);

export default Teacher;