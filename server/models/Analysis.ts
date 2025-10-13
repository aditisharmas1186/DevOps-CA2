import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  results: {
    ec: { type: Number, required: true },      // E.coli
    sa: { type: Number, required: true },      // S.Aureus
    kp: { type: Number, required: true },      // Klebsiella Pneumonae
    invalid: { type: Number, required: true }  // Invalid classification
  },
  notes: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export const Analysis = mongoose.model('Analysis', AnalysisSchema);
