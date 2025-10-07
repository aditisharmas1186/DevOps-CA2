import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  department: { type: String, required: true },
  doctor: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  message: String, // optional
}, {
  timestamps: true,  // automatically adds createdAt and updatedAt
});

export default mongoose.model("Appointment", appointmentSchema);
