import Submission from "../models/Submission.js";
import User from "../models/User.js";
import Problem from "../models/Problem.js";

export const submitSolution = async (req, res) => {
  const { problemId, code, language } = req.body;
  const userId = req.user.user.id; // Assuming you have authentication middleware
    // console.log(userId);
  try {
    // Create new submission
    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
    });

    const sub = await submission.save();
    console.log(sub);

    // Update user's submissions
    await User.findByIdAndUpdate(userId, {
      $push: { submissions: submission._id },
    });

    // Update problem's submissions
    await Problem.findByIdAndUpdate(problemId, {
      $push: { submissions: submission._id },
    });

    res
      .status(201)
      .json({ message: "Submission received", submissionId: submission._id });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Failed to submit solution" });
  }
};

export const getSubmissions = async (req, res) => {
  const userId = req.user.id; // Assuming you have authentication middleware

  try {
    const submissions = await Submission.find({ user: userId })
      .populate("problem", "title") // Populate problem title
      .sort({ createdAt: -1 }); // Sort by most recent first

    res.json(submissions);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
};

export const getSubmissionById = async (req, res) => {
  const { submissionId } = req.params;

  try {
    const submission = await Submission.findById(submissionId)
      .populate("problem", "title")
      .populate("user", "username");

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    res.json(submission);
  } catch (error) {
    console.error("Error fetching submission:", error);
    res.status(500).json({ error: "Failed to fetch submission" });
  }
};
