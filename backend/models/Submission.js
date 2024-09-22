import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error'],
    default: 'Pending'
  },
  executionTime: {
    type: Number
  },
  memoryUsed: {
    type: Number
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  nftMinted: {
    type: Boolean,
    default: false
  },
  nftTokenId: {
    type: String
  }
}, { timestamps: true });

export default mongoose.model('Submission', submissionSchema);