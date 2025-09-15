import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp'],
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Accepted', 'Wrong Answer', 'Runtime Error', 'Compilation Error', 'Time Limit Exceeded'],
    default: 'Pending',
  },
  output: {
    type: String,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;