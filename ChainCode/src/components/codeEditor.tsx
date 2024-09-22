import { useState } from "react";
import { Button } from "@/components/ui/button";
import Editor from "@monaco-editor/react";
import { useProblemContext } from "@/context/ProblemContext";
import { submitCode } from "@/utils/submitCode";
import { useNavigate } from "react-router-dom";

// Map of our language identifiers to Monaco Editor language identifiers
const languageMap = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

// Map our language identifiers to Judge0 language IDs
const judge0LanguageMap = {
  javascript: 63, // Node.js
  python: 71, // Python 3
  java: 62, // Java
  cpp: 105, // C++
};

interface ResultType {
  error?: string;
  results?: Array<{
    status?: { description: string };
    time?: number;
    memory?: number;
  }>;
}

export default function CodeEditor() {
  const { code, setCode, selectedProblem, language } = useProblemContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const navigate = useNavigate();

  // Get the correct language identifier for Monaco Editor
  const editorLanguage =
    languageMap[language as keyof typeof languageMap] || language;

  const handleSubmit = async () => {
    // console.log(code);
    setIsSubmitting(true);
    setResult(null);

    try {
      // console.log(flattenCodeToString(code))
      const data = await submitCode(
        selectedProblem?._id || "", // Changed from '0' to an empty string as the default
        judge0LanguageMap[language as keyof typeof judge0LanguageMap],
        code
      );
      setResult(data);
    } catch (error) {
      console.error("Error submitting code:", error);
      setResult({ error: "An error occurred while submitting your code." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateNFT = () => {
    navigate("/nft");
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <Editor
        height="70vh"
        language={editorLanguage}
        value={code}
        onChange={(value) => setCode(value || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
        }}
      />
      <div className="mt-4 flex justify-between items-center">
        <div>
          <Button
            onClick={handleSubmit}
            disabled={!selectedProblem || isSubmitting}
            className="mr-2"
          >
            {isSubmitting ? "Submitting..." : "Submit Solution"}
          </Button>
          <Button onClick={handleCreateNFT}>Create NFT</Button>
        </div>
        {result && (
          <div>
            {result.results ? (
              result.results.map((r, index) => (
                <p key={index}>
                  Test Case {index + 1}: {r.status?.description}, Time: {r.time}{" "}
                  seconds, Memory: {r.memory} KB
                </p>
              ))
            ) : (
              <p className="text-red-500">{result.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
