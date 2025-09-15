import Question from '../models/Question.js';
import User from '../models/User.js';
import axios from 'axios';

// Helper function to call Judge0 - you can expand this with your runController logic
const callJudge0 = async (code, languageId, stdin) => {
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: { base64_encoded: 'false', fields: '*' },
        headers: {
            'content-type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        },
        data: {
            language_id: languageId,
            source_code: code,
            stdin: stdin
        }
    };

    const submissionResponse = await axios.request(options);
    const token = submissionResponse.data.token;

    let resultResponse;
    do {
        await new Promise(resolve => setTimeout(resolve, 1500));
        resultResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=*`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            }
        });
    } while (resultResponse.data.status.id <= 2);

    return resultResponse.data;
};

// Main submit logic
export const submitSolution = async (req, res) => {
    const { questionId, code, language } = req.body;
    const userId = req.user.id;

    const languageIds = { javascript: 93, python: 71, java: 91, cpp: 54 };
    const languageId = languageIds[language];

    if (!languageId) {
        return res.status(400).json({ message: 'Unsupported language' });
    }

    try {
        const question = await Question.findById(questionId);
        if (!question || !question.testCases || question.testCases.length === 0) {
            return res.status(404).json({ message: 'Question or test cases not found' });
        }

        for (let i = 0; i < question.testCases.length; i++) {
            const testCase = question.testCases[i];
            const result = await callJudge0(code, languageId, testCase.input);

            // Simple comparison (trims whitespace). You can make this more robust.
            const isCorrect = result.stdout?.trim() === testCase.expectedOutput.trim();

            if (result.status.id !== 3 || !isCorrect) {
                return res.json({
                    status: 'Wrong Answer',
                    message: `Failed on test case #${i + 1}`,
                    input: testCase.input,
                    output: result.stdout || result.stderr || result.compile_output,
                    expected: testCase.expectedOutput,
                });
            }
        }

        // If all test cases pass, update user progress
        await User.findByIdAndUpdate(userId, {
            $addToSet: { solvedProblems: questionId } // $addToSet prevents duplicates
        });

        res.json({ status: 'Accepted', message: 'Congratulations! All test cases passed.' });

    } catch (error) {
        console.error("Submission Error:", error);
        res.status(500).json({ message: 'An error occurred during submission.' });
    }
};