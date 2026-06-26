import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema(
  {
    content: { type: String, required: true, maxlength: 3000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, required: true, maxlength: 3000 },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, required: true, default: 'Chandigarh', trim: true },
    answers: [answerSchema],
  },
  { timestamps: true }
);

questionSchema.index({ city: 1, createdAt: -1 });
questionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
