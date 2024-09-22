import axios from "axios";

function encodeBase64(str: string) {
  return btoa(unescape(encodeURIComponent(str)));
}

export async function submitCode(
  problemId: string,
  language: number,
  code: string
) {
  try {
    // Fetch test cases for the problem
    const testCasesResponse = await axios.get(
      `http://localhost:5000/problems/${problemId}`
    );
    const testCases = testCasesResponse.data.testcases;

    // Submit code to Judge0 for each test case
    const results = await Promise.all(
      testCases.map(async (testCase: any) => {
        const response = await axios.post(
          "https://judge0-ce.p.rapidapi.com/submissions",
          {
            language_id: language,
            source_code: encodeBase64(code),
            stdin: encodeBase64(testCase.input),
            expected_output: encodeBase64(testCase.output),
            base64_encoded: true,
          },
          {
            headers: {
              "content-type": "application/json",
              "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_API_KEY,
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
            },
          }
        );

        const { token } = response.data;
        console.log("Submission token:", token);
        
        // Poll for the result
        return await pollForResult(token);
      })
    );

    return { results };
  } catch (error) {
    console.error("Error submitting code:", error);
    return { error: "An error occurred while submitting your code." };
  }
}

async function pollForResult(token: string) {
  let result;
  let attempts = 0;
  const maxAttempts = 10;
  const delay = 2000; // 2 seconds

  while (attempts < maxAttempts) {
    const response = await axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          "X-RapidAPI-Key": import.meta.env.VITE_JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
      }
    );

    result = response.data;

    if (result.status.id >= 3) {
      // If status is not "In Queue" or "Processing"
      return {
        status: result.status,
        stdout: result.stdout ? atob(result.stdout) : null,
        stderr: result.stderr ? atob(result.stderr) : null,
        compile_output: result.compile_output ? atob(result.compile_output) : null,
        time: result.time,
        memory: result.memory,
      };
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("Polling timed out");
}
