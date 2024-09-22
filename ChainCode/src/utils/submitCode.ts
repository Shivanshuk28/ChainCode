import axios from "axios";
import { jwtDecode } from 'jwt-decode'

function formatCode(input: string) {
  // Replace escaped newline (\n) with actual newlines
  let formattedCode = input.replace(/\\n/g, "\n");

  // Replace escaped backslashes (\\) with a single backslash (\)
  formattedCode = formattedCode.replace(/\\\\/g, "\\");

  // Replace escaped quotes (\") with regular quotes (")
  formattedCode = formattedCode.replace(/\\"/g, '"');

  return formattedCode;
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
            source_code: formatCode(code),
            stdin: testCase.input,
            expected_output: testCase.output,
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

    // Check if all test cases passed
    const allTestsPassed = results.every((result) => result.status.id === 3); // 3 is the status ID for "Accepted"

    if (allTestsPassed) {
      // If all tests passed, save the submission
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Login to save your submission");
      }

      const saveSubmissionResponse = await axios.post(
        "http://localhost:5000/submissions/submit",
        {
          problemId:problemId,
          code: formatCode(code),
          language: language.toString(), // Convert language ID to string
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (saveSubmissionResponse.status === 201) {
        console.log(
          "Submission saved successfully:",
          saveSubmissionResponse.data
        );
      } else {
        console.error(
          "Failed to save submission:",
          saveSubmissionResponse.data
        );
      }
    }

    return { results, allTestsPassed };
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
      `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
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
        stdout: result.stdout ? result.stdout : null,
        stderr: result.stderr ? result.stderr : null,
        compile_output: result.compile_output ? result.compile_output : null,
        time: result.time,
        memory: result.memory,
      };
    }

    attempts++;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  throw new Error("Polling timed out");
}
