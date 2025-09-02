import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nativeLanguage: { type: String, required: true },
  learningLanguages: [{ type: String }],
  progress: {
    type: Map,
    of: Number,
    default: {}
  },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);