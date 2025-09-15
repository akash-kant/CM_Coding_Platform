import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    // required: true, // <-- This line has been removed to make it optional
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
  },
  hints: {
    type: [String],
    default: []
  },
  starterCode: [
    {
      language: { type: String, required: true },
      code: { type: String, required: true }
    }
  ],
  testCases: [
    {
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
    }
  ]
}, {
  timestamps: true,
});

const Question = mongoose.model('Question', QuestionSchema);

export default Question;