import mongoose from "mongoose";

const request = new mongoose.Schema({
    requestId: {
        type: String,
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },  
    caretaker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Caretaker"
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    }
}, { timestamps: true });

export const Requests = mongoose.model("Request", requests);