import express from 'express';
import { configDotenv } from 'dotenv';
import { connectDB } from './src/db/index.js';
import { DB_NAME } from './constants.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// Load environment variables first
configDotenv();

console.log("MONGODB_URI:", process.env.MONGODB_URI);
console.log("DB_NAME:", DB_NAME);

const app = express();

app.use(cors(
    {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Connect to database
connectDB()
.then(() => {
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
})
.catch((error) => {
console.log("Error connecting to MongoDB:", error);
});

//routes import
import userRouter from './src/routes/user.routes.js';

//routes delaration
app.use("/users", userRouter);