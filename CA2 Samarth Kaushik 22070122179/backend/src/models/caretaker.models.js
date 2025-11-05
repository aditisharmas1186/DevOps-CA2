import mongoose from 'mongoose';

const ctSchema = new mongoose.Schema({
    username: { type: String, required: true, index: true, unique: true },
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobile: { type: String, required: true },
    location: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    experience: { type: Number, required: true },
    qualifications: { type: String, required: true },
    specialization: { type: String, required: true },
    requests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request"
        }
    ],
    refreshToken: { type: String }
}, { timestamps: true });

ctSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

ctSchema.methods.isCorrectPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

ctSchema.methods.generateAccessToken = function () {
    return jsonwebtoken.sign(
        { id: this._id, username: this.username, email: this.email },
        process.env.JWT_AUTH_SECRET,
        { expiresIn: process.env.AUTH_EXPIRY }
    );
};

ctSchema.methods.generateRefreshToken = function () {
    return jsonwebtoken.sign(
        { id: this._id, username: this.username, email: this.email },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: process.env.REFRESH_EXPIRY }
    );
};

export const Caretaker = mongoose.model("Caretaker", ctSchema);
