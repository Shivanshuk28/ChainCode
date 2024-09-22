import mongoose from 'mongoose';

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  testcases: [
    {
      input: { type: String, required: true },
      output: { type: String, required: true }
    }
  ],
  
}, { timestamps: true });

export default mongoose.model('Problem', problemSchema);
