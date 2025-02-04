import fs from 'fs';

const environment = JSON.parse(fs.readFileSync(new URL('../environment.json', import.meta.url)));

import mongoose from 'mongoose';

console.log('MongoDB URI:', environment.Mongo);

const connectDB = async () => {
    try {
        await mongoose.connect(environment.Mongo);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

export { connectDB };
