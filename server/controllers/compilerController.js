import { executeCode } from '../services/compilerService.js';
import Question from '../models/Question.js';
import Submission from '../models/Submission.js';
import User from '../models/User.js';

// For "Run Code" button - executes with custom input
export const runCode = async (req, res) => {
    const { code, language, stdin } = req.body;
    try {
        const result = await executeCode(code, language, stdin);
        res.status(200).json(result);
    } catch (error) {
        console.error("RUN CODE ERROR:", error);
        res.status(500).json({ message: 'Error executing code', error: error.message });
    }
};

// For "Submit" button - executes against all hidden test cases
export const submitCode = async (req, res) => {
    const { questionId, code, language } = req.body;
    const userId = req.user.id;

    try {
        const question = await Question.findById(questionId);
        if (!question || !question.testCases || question.testCases.length === 0) {
            return res.status(404).json({ message: 'Question or test cases not found' });
        }

        for (let i = 0; i < question.testCases.length; i++) {
            const testCase = question.testCases[i];
            const result = await executeCode(code, language, testCase.input);
            
            // Simple comparison (trims whitespace).
            const isCorrect = result.stdout?.trim() === testCase.expectedOutput.trim();

            if (result.status.id !== 3 || !isCorrect) {
                await Submission.create({ user: userId, question: questionId, code, language, status: 'Wrong Answer', output: result.stdout || result.stderr || result.compile_output });
                return res.json({
                    status: 'Wrong Answer',
                    message: `Failed on test case #${i + 1}`,
                    input: testCase.input,
                    output: result.stdout || "No output",
                    expected: testCase.expectedOutput,
                });
            }
        }

        // If all test cases pass...
        await Submission.create({ user: userId, question: questionId, code, language, status: 'Accepted' });
        await User.findByIdAndUpdate(userId, {
            $addToSet: { solvedProblems: questionId }
        });
        return res.json({ status: 'Accepted', message: 'Congratulations! All test cases passed.' });

    } catch (error) {
        console.error("SUBMISSION ERROR:", error);
        res.status(500).json({ message: 'An error occurred during submission.' });
    }
};