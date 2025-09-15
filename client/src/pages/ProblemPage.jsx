import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { dracula } from '@uiw/codemirror-theme-dracula';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import api from '@/api/axios';

const languages = {
  javascript: javascript(),
  python: python(),
  java: java(),
  cpp: cpp(),
};

const ProblemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, fetchUserProgress } = useAuth();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/questions/${id}`);
        setQuestion(data);
        const jsStarterCode = data.starterCode?.find(sc => sc.language === 'javascript');
        if (jsStarterCode) {
          setCode(jsStarterCode.code);
        } else if (data.starterCode?.length > 0) {
          setCode(data.starterCode[0].code);
          setLanguage(data.starterCode[0].language);
        }
      } catch (error) {
        console.error("Failed to fetch question", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchQuestion();
  }, [id]);

  const handleLanguageChange = (selectedLang) => {
    setLanguage(selectedLang);
    const newStarterCode = question.starterCode?.find(sc => sc.language === selectedLang);
    if (newStarterCode) setCode(newStarterCode.code);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput({ status: { description: "Running..." }});
    try {
      const { data } = await api.post('/compiler/run', { code, language, stdin: "" });
      setOutput(data);
    } catch (error) {
      setOutput({ stderr: "Failed to connect to the server. Please try again." });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!token) {
        alert("Please log in to submit a solution.");
        return;
    }
    setIsRunning(true);
    setOutput({ status: { description: "Submitting..." }});
    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.post('/compiler/submit', { code, language, questionId: id }, config);
        setOutput(data);
        if (data.status === 'Accepted') {
            await fetchUserProgress(token);
            setTimeout(() => navigate('/dashboard'), 1500);
        }
    } catch (error) {
        setOutput({ stderr: "Submission failed. " + (error.response?.data?.message || "") });
    } finally {
        setIsRunning(false);
    }
  };

  // --- THIS FUNCTION IS NOW UPGRADED ---
  const renderOutput = () => {
    if (!output) return <div className="text-gray-400">Click "Run Code" or "Submit" to see the output.</div>;

    // Handle verdict from our backend's SUBMIT endpoint
    if (output.status === 'Accepted') {
      return <pre className="text-green-400 whitespace-pre-wrap">{output.message}</pre>;
    }
    if (output.status === 'Wrong Answer') {
      return (
        <div className="text-red-400 whitespace-pre-wrap">
          <p className="font-bold">{output.message}</p>
          <p className="mt-2">Input:<br /><span className="text-gray-300">{output.input}</span></p>
          <p className="mt-2">Your Output:<br /><span className="text-gray-300">{output.output}</span></p>
          <p className="mt-2">Expected Output:<br /><span className="text-gray-300">{output.expected}</span></p>
        </div>
      );
    }

    // Handle raw output from Judge0's RUN endpoint
    if (output.status?.description) {
      const statusText = output.status.description;
      if (statusText === 'Accepted') return <pre className="text-green-400 whitespace-pre-wrap">{output.stdout || 'Execution successful.'}</pre>;
      if (statusText === 'Compilation Error') return <pre className="text-red-400 whitespace-pre-wrap">{output.compile_output}</pre>;
      if (statusText.includes('Runtime Error')) return <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>;
      return <div className="text-yellow-400">{statusText}</div>;
    }

    // Fallback for other errors
    return <pre className="text-red-400 whitespace-pre-wrap">{output.stderr || output.message || "An unknown error occurred."}</pre>;
  };

  if (loading) return <div className="text-center p-10">Loading Problem...</div>;
  if (!question) return <div className="text-center p-10">Problem not found.</div>;

  return (
    <div className="container mx-auto py-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* ... Left Column for Description and Hints ... */}
      <div className="space-y-8">
        <Card>
          <CardHeader><CardTitle className="text-2xl">{question.title}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <p className="text-sm">Topic: <span className="font-semibold">{question.topic}</span></p>
              <p className="text-sm">Difficulty: <span className="font-semibold">{question.difficulty}</span></p>
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {question.description || "No description available."}
            </p>
          </CardContent>
        </Card>
        {question.hints && question.hints.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Hints</CardTitle></CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {question.hints.map((hint, index) => (
                  <AccordionItem value={`item-${index + 1}`} key={index}>
                    <AccordionTrigger>Hint #{index + 1}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">{hint}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Column for Code Editor and Output */}
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Code Editor</CardTitle>
            <Select onValueChange={handleLanguageChange} value={language}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Select Language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <CodeMirror value={code} height="60vh" extensions={[languages[language]]} theme={dracula} onChange={(value) => setCode(value)} />
            <div className="flex justify-end gap-4 mt-4">
              <Button onClick={handleRunCode} disabled={isRunning} variant="secondary">{isRunning ? 'Processing...' : 'Run Code'}</Button>
              <Button onClick={handleSubmit} disabled={isRunning}>{isRunning ? 'Processing...' : 'Submit'}</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Output</CardTitle></CardHeader>
          <CardContent className="bg-gray-900 rounded-md p-4 font-mono text-sm min-h-[100px]">
            {renderOutput()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProblemPage;