import axios from 'axios';

// Map our application's language names to the specific IDs Judge0 uses
const languageIds = {
    javascript: 93,
    python: 71,
    java: 91,
    cpp: 54,
};

/**
 * Executes a piece of code using the Judge0 API.
 * It submits the code, gets a token, and then polls for the result.
 * Includes a timeout to prevent getting stuck.
 * @param {string} code The source code to execute.
 * @param {string} language The programming language.
 * @param {string} stdin The standard input to provide to the code.
 * @returns {Promise<object>} The final result from Judge0.
 */
export const executeCode = async (code, language, stdin) => {
    const languageId = languageIds[language];
    if (!languageId) {
        throw new Error('Unsupported language');
    }

    // Options for the initial submission POST request
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
            stdin: stdin || ""
        }
    };

    // 1. Submit the code and get a token
    const submissionResponse = await axios.request(options);
    const token = submissionResponse.data.token;

    let resultResponse;
    let attempts = 0;
    const maxAttempts = 10; // Try a maximum of 10 times (approx 15 seconds)

    // 2. Poll for the result using the token
    do {
        // Wait for 1.5 seconds between each check
        await new Promise(resolve => setTimeout(resolve, 1500));

        resultResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false&fields=*`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
            }
        });
        attempts++;
    } while (
        // Keep polling if the status is "In Queue" (1) or "Processing" (2)
        (resultResponse.data.status.id === 1 || resultResponse.data.status.id === 2) &&
        attempts < maxAttempts
    );

    // 3. If the loop finished because it reached max attempts, throw a timeout error
    if (resultResponse.data.status.id <= 2) {
        throw new Error("Code execution timed out. The judge might be busy or there could be an error in your code.");
    }

    // 4. Return the final result
    return resultResponse.data;
};
