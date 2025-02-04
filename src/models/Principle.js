// models/Principle.js
import mongoose from 'mongoose';

const PrincipleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    contact: { type: String, required: true },
    dateOfJoining: { type: Date, default: Date.now },
});

const Principle = mongoose.model('Principle', PrincipleSchema);

export default Principle;