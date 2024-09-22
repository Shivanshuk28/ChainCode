import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import axios from 'axios';

interface TestCase {
  input: string;
  output: string;
}

interface Problem {
  _id: string;  // Changed from 'id' to '_id'
  title: string;
  description: string;
  testCases: TestCase[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

interface ProblemContextType {
  problems: Problem[];
  selectedProblem: Problem | null;
  setSelectedProblem: (problem: Problem | null) => void;
  fetchProblemById: (id: string) => Promise<void>;
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  isLoading: boolean;
  error: string | null;
}

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export const ProblemProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('http://localhost:5000/problems');
        setProblems(response.data);
      } catch (error) {
        setError('Error fetching problems. Please try again later.');
        console.error('Error fetching problems:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const fetchProblemById = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:5000/problems/${id}`);
      setSelectedProblem(response.data);
    } catch (error) {
      setError('Error fetching problem. Please try again later.');
      console.error('Error fetching problem:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProblemContext.Provider value={{ 
      problems,
      selectedProblem, 
      setSelectedProblem,
      fetchProblemById,
      code, 
      setCode,
      language,
      setLanguage,
      isLoading,
      error
    }}>
      {children}
    </ProblemContext.Provider>
  );
};

export const useProblemContext = () => {
  const context = useContext(ProblemContext);
  if (context === undefined) {
    throw new Error('useProblemContext must be used within a ProblemProvider');
  }
  return context;
};