import mongoose from 'mongoose';

const answerEntrySchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { _id: false },
);

const userAnswersSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    answers: { type: [answerEntrySchema], required: true },
  },
  { timestamps: true },
);

export default mongoose.model('UserAnswers', userAnswersSchema);
