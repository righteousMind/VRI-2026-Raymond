import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    age: Number,
    workStart: String,           // "09:00"
    workEnd: String,             // "17:30"
    commuteMinutes: Number,
    dinnerTime: String,          // "19:30"
    dailyStepGoal: Number,
    preferredExercise: String,
    mostEnergeticTime: String,   // "Morning" | "Afternoon" | "Evening"
    activityLevel: String,       // "Below target" | "On target" | "Above target"
  },
  { _id: false },
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    latinIndex: { type: Number, unique: true, sparse: true },
    profile: { type: profileSchema, default: {} },
  },
  { timestamps: true },
);

export const User = mongoose.model('User', userSchema);
