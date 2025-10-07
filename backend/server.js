import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Appointment from "./models/Appointment.js";

const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not set");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

mongoose.connection.on("connected", () => {
  console.log("✅ Mongoose connected");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ Mongoose connection error:", err);
});
mongoose.connection.on("disconnected", () => {
  console.log("❌ Mongoose disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.log("✅ Mongoose reconnected");
});

app.get("/api", (req, res) => {
  res.json({ message: "Backend is running" });
});

app.post("/api/appointment", async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.json({ status: "success", msg: `Appointment booked for ${req.body.name}` });
  } catch (err) {
    console.error("Error saving appointment:", err);
    res.status(500).json({ status: "error", msg: "Failed to save appointment" });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

// Graceful shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Mongo connection closed through app termination");
  process.exit(0);
});
