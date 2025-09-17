import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { useTheme } from '@/context/ThemeContext';
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
  const { theme } = useTheme();
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('pp-lang') || 'javascript');
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('pp-font')) || 14);
  const [showInput, setShowInput] = useState(false);
  const [customInput, setCustomInput] = useState('');
  const [splitPercent, setSplitPercent] = useState(() => Number(localStorage.getItem('pp-split')) || 60); // editor height %
  const isDraggingRef = useRef(false);
  const [colSplitPercent, setColSplitPercent] = useState(() => Number(localStorage.getItem('pp-colsplit')) || 50); // left/right %
  const isDraggingColsRef = useRef(false);

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
    localStorage.setItem('pp-lang', selectedLang);
    const newStarterCode = question.starterCode?.find(sc => sc.language === selectedLang);
    if (newStarterCode) setCode(newStarterCode.code);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput({ status: { description: "Running..." }});
    try {
      const { data } = await api.post('/compiler/run', { code, language, stdin: showInput ? customInput : "" });
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

  // --- Enhanced output rendering ---
  const renderOutput = () => {
    if (!output) return <div className="text-gray-400">Click "Run Code" or "Submit" to see the output.</div>;

    // Handle verdict from our backend's SUBMIT endpoint
    if (output.status === 'Accepted') {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600/20 text-green-300 border-green-600" variant="outline">Accepted</Badge>
            {output.time && <span className="text-xs text-muted-foreground">{output.time} ms</span>}
          </div>
          <pre className="text-green-400 whitespace-pre-wrap">{output.message}</pre>
        </div>
      );
    }
    if (output.status === 'Wrong Answer') {
      return (
        <div className="text-red-400 whitespace-pre-wrap space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600/20 text-red-300 border-red-600" variant="outline">Wrong Answer</Badge>
          </div>
          <p className="font-semibold">{output.message}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Input</p>
              <div className="bg-black/30 rounded p-2 text-gray-300">{output.input}</div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Your Output</p>
              <div className="bg-black/30 rounded p-2 text-gray-300">{output.output}</div>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1">Expected Output</p>
              <div className="bg-black/30 rounded p-2 text-gray-300">{output.expected}</div>
            </div>
          </div>
        </div>
      );
    }

    // Handle raw output from Judge0's RUN endpoint
    if (output.status?.description) {
      const statusText = output.status.description;
      if (statusText === 'Accepted') return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-600/20 text-green-300 border-green-600" variant="outline">Accepted</Badge>
            {output.time && <span className="text-xs text-muted-foreground">{output.time} ms</span>}
          </div>
          <pre className="text-green-400 whitespace-pre-wrap">{output.stdout || 'Execution successful.'}</pre>
        </div>
      );
      if (statusText === 'Compilation Error') return (
        <div className="space-y-2">
          <Badge className="bg-red-600/20 text-red-300 border-red-600" variant="outline">Compilation Error</Badge>
          <pre className="text-red-400 whitespace-pre-wrap">{output.compile_output}</pre>
        </div>
      );
      if (statusText.includes('Runtime Error')) return (
        <div className="space-y-2">
          <Badge className="bg-red-600/20 text-red-300 border-red-600" variant="outline">Runtime Error</Badge>
          <pre className="text-red-400 whitespace-pre-wrap">{output.stderr}</pre>
        </div>
      );
      return <div className="text-yellow-400">{statusText}</div>;
    }

    // Fallback for other errors
    return <pre className="text-red-400 whitespace-pre-wrap">{output.stderr || output.message || "An unknown error occurred."}</pre>;
  };

  // keyboard shortcut: Ctrl/Cmd + Enter to Run
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isRunning) handleRunCode();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isRunning, handleRunCode]);

  const onFontChange = (size) => {
    setFontSize(size);
    localStorage.setItem('pp-font', String(size));
  };

  // drag to resize split inside editor card
  const startDrag = useCallback(() => {
    isDraggingRef.current = true;
    document.body.classList.add('select-none');
  }, []);
  const stopDrag = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      document.body.classList.remove('select-none');
    }
    if (isDraggingColsRef.current) {
      isDraggingColsRef.current = false;
      document.body.classList.remove('select-none');
    }
  }, []);
  const onDrag = useCallback((e) => {
    if (!isDraggingRef.current) return;
    const container = document.getElementById('editor-output-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const pct = Math.min(80, Math.max(30, (y / rect.height) * 100));
    setSplitPercent(pct);
    localStorage.setItem('pp-split', String(Math.round(pct)));
  }, []);
  const startDragCols = useCallback(() => {
    isDraggingColsRef.current = true;
    document.body.classList.add('select-none');
  }, []);
  const onDragCols = useCallback((e) => {
    if (!isDraggingColsRef.current) return;
    const container = document.getElementById('cols-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.min(70, Math.max(30, (x / rect.width) * 100));
    setColSplitPercent(pct);
    localStorage.setItem('pp-colsplit', String(Math.round(pct)));
  }, []);
  useEffect(() => {
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mousemove', onDragCols);
    window.addEventListener('mouseup', stopDrag);
    return () => {
      window.removeEventListener('mousemove', onDrag);
      window.removeEventListener('mousemove', onDragCols);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [onDrag, stopDrag]);

  if (loading) return <div className="text-center p-10">Loading Problem...</div>;
  if (!question) return <div className="text-center p-10">Problem not found.</div>;

  return (
    <div className="w-full mx-auto px-2 md:px-2 lg:px-4 py-3">
      <div id="cols-container" className="relative flex gap-4" style={{ minHeight: 'calc(88vh)' }}>
        {/* Left column */}
        <div style={{ width: `${colSplitPercent}%` }} className="space-y-4">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/10 via-transparent to-transparent">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{question.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="uppercase">{question.topic}</Badge>
                  <Badge variant="outline" className={
                    question.difficulty?.toLowerCase() === 'easy' ? 'bg-green-700/20 text-green-300 border-green-600' :
                    question.difficulty?.toLowerCase() === 'medium' ? 'bg-yellow-700/20 text-yellow-300 border-yellow-600' :
                    'bg-red-700/20 text-red-300 border-red-600'
                  }>
                    {question.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
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

        {/* Draggable vertical divider */}
        <div
          onMouseDown={startDragCols}
          className="absolute top-0 bottom-0"
          style={{ left: `calc(${colSplitPercent}% + 8px)`, width: 12, cursor: 'col-resize' }}
        >
          <div className="mx-auto w-1 h-full rounded bg-border" />
        </div>

        {/* Right column */}
        <div style={{ width: `calc(${100 - colSplitPercent}% - 12px)` }} className="space-y-4 ml-[12px]">
          {/* Toolbar box */}
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <CardTitle className="text-base">Tools</CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Language</span>
                    <Select onValueChange={handleLanguageChange} value={language}>
                      <SelectTrigger className="w-[150px]"><SelectValue placeholder="Select Language" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Font</span>
                    <Select value={String(fontSize)} onValueChange={(v) => onFontChange(Number(v))}>
                      <SelectTrigger className="w-[100px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="14">14</SelectItem>
                        <SelectItem value="16">16</SelectItem>
                        <SelectItem value="18">18</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" onClick={() => setShowInput(v => !v)}>{showInput ? 'Hide Input' : 'Custom Input'}</Button>
                    <Button onClick={handleRunCode} disabled={isRunning} variant="outline">{isRunning ? 'Processing…' : 'Run (Ctrl+Enter)'}</Button>
                    <Button onClick={handleSubmit} disabled={isRunning}>{isRunning ? 'Processing…' : 'Submit'}</Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Editor + Output boxed areas within a single card */}
          <Card className="overflow-hidden">
            <CardHeader className="py-3 px-4 border-b">
              <CardTitle className="text-base">Workspace</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {showInput && (
                <div className="px-4 pt-4">
                  <label className="text-sm text-muted-foreground">Stdin</label>
                  <textarea
                    className="mt-1 w-full rounded-md border bg-background p-2 font-mono text-sm"
                    rows={3}
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Provide input for your program…"
                  />
                </div>
              )}

              <div id="editor-output-container" className="relative" style={{ height: showInput ? 'calc(70vh)' : 'calc(78vh)' }}>
                <div style={{ height: `${splitPercent}%` }} className="border-b">
                  <div className="px-4 py-2 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Code Editor</span>
                  </div>
                  <CodeMirror
                    value={code}
                    height={`calc(${splitPercent}vh)`}
                    extensions={[languages[language]]}
                    theme={dracula}
                    onChange={(value) => setCode(value)}
                    basicSetup={{ lineNumbers: true }}
                    style={{ fontSize: `${fontSize}px` }}
                  />
                </div>
                <div onMouseDown={startDrag} className="absolute left-0 right-0" style={{ top: `calc(${splitPercent}% - 6px)`, height: 12, cursor: 'row-resize' }}>
                  <div className="mx-auto h-1 w-40 rounded bg-border" />
                </div>
                <div className="font-mono text-sm overflow-auto" style={{ position: 'absolute', top: `calc(${splitPercent}% + 6px)`, bottom: 0, left: 0, right: 0 }}>
                  <div className="px-4 py-2 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Output</span>
                  </div>
                  <div className="bg-gray-900 p-4 min-h-[120px]">
                    {renderOutput()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;