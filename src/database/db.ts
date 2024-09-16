import mongoose from 'mongoose';
mongoose.set('strictQuery', true);
const connectToDatabase = async () => {
    try {
        const options: any = {  
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };

        await mongoose.connect(process.env.DATABASE_URL, options);
        console.log('Connected to the database');
    } catch (err) {
        console.error('Error connecting to the database:', err);
    }
};

export default connectToDatabase;