import mongoose from 'mongoose';

// One document per completed trial (question). A user produces 9 documents total.
const sessionSchema = new mongoose.Schema(
  {
    userId:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionIndex: { type: Number, required: true },   // 0–8, which question was answered
    delay:         { type: Number, required: true },   // delay in seconds: 1.5 | 4 | 6
    cueType:       { type: String, enum: ['generic', 'transparent', 'humorous'], required: true }, // latin square condition
    cueText:       { type: String },                   // exact cue text shown to the user
    answerText:    { type: String },                   // answer text that was played as TTS
    // createdAt added automatically by timestamps — marks when the trial completed
  },
  { timestamps: true },
);

export const Session = mongoose.model('Session', sessionSchema);
