import axios from 'axios';

const runCode = async (req, res) => {
  const { code, language, stdin } = req.body; // `stdin` is the input for the code

  // Map our language names to Judge0 language IDs
  const languageIds = {
    javascript: 93,
    python: 71,
    java: 91,
    cpp: 54,
  };

  const languageId = languageIds[language];

  if (!languageId) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

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
      stdin: stdin || "" // Use provided input or default to empty
    }
  };

  try {
    // 1. Create a submission to get a token
    const submissionResponse = await axios.request(options);
    const submissionToken = submissionResponse.data.token;

    // 2. Poll for the result using the token
    let resultResponse;
    do {
      // Wait for a moment before checking the result
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      
      resultResponse = await axios.get(`https://judge0-ce.p.rapidapi.com/submissions/${submissionToken}?base64_encoded=false&fields=*`, {
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
          'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
        }
      });
    } while (resultResponse.data.status.id <= 2); // Status 1: In Queue, Status 2: Processing

    // 3. Send the final result back to our frontend
    res.status(200).json(resultResponse.data);

  } catch (error) {
    console.error(error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred while running the code.' });
  }
};

export { runCode };