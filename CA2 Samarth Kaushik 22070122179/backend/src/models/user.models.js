import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true, unique: true },
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true, index: true },
    age: { type: Number, required: true },
    location: { type: String, required: true, index: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    medicalHistory: [
        {
            condition: { type: String, required: true },
            diagnosisDate: { type: Date, required: true },
            treatment: { type: String, required: true }
        }
    ],
    medications: [
        {
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            frequency: { type: String, required: true }
        }
    ],
    caretaker: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Caretaker"
        }
    ],
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request"
        }
    ],
    refreshToken: { type: String }
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jsonwebtoken.sign(
        { id: this._id, username: this.username, email: this.email },
        process.env.JWT_AUTH_SECRET,
        { expiresIn: process.env.AUTH_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken.sign(
        { id: this._id, username: this.username, email: this.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRY }
    );
};

export const User = mongoose.model("User", userSchema);
