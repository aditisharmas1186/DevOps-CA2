import asyncHandler from './../utils/asyncHandler.js';
import { upload } from '../middlewares/multer.middleware.js';

const registerUser = asyncHandler(async (req, res) => {
    const {username, FullName, email, password} = req.body;
    console.log("Received user data:", {email});
    res.send({message: "User registered successfully", email});
});

export default registerUser;