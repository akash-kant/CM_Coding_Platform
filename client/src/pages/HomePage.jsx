import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle } from 'lucide-react';
import api from '@/api/axios';

const HomePage = () => {
  const { solvedSet } = useAuth();
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAllTopics = async () => {
      try {
        const { data } = await api.get('/questions');
        const uniqueTopics = [...new Set(data.map(q => q.topic))];
        setTopics(uniqueTopics);
      } catch (error) {
        console.error("Failed to fetch topics", error);
      }
    };
    fetchAllTopics();
  }, []);

  const handleGenerate = async () => {
    if (!selectedTopic || !selectedDifficulty) {
      alert("Please select a topic and a difficulty.");
      return;
    }
    setLoading(true);
    setFilteredQuestions([]);
    try {
      const { data } = await api.get(`/questions?topic=${selectedTopic}&difficulty=${selectedDifficulty}`);
      setFilteredQuestions(data);
    } catch (error) {
      console.error("Failed to fetch filtered questions", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <Card>
          <CardHeader><CardTitle>Find a Challenge</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Topic</label>
              <Select onValueChange={setSelectedTopic} value={selectedTopic}>
                <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                <SelectContent>
                  {topics.map(topic => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty</label>
              <Select onValueChange={setSelectedDifficulty} value={selectedDifficulty}>
                <SelectTrigger><SelectValue placeholder="Select a difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Easy">Easy</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleGenerate} disabled={loading} className="w-full">{loading ? 'Generating...' : 'Generate Questions'}</Button>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        <Card className="min-h-[60vh]">
          <CardHeader><CardTitle>Generated Questions</CardTitle></CardHeader>
          <CardContent>
            {filteredQuestions.length > 0 ? (
              <ul className="space-y-3">
                {filteredQuestions.map(q => (
                  <li key={q._id} className="p-4 rounded-md border flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{q.title}</h3>
                      <p className="text-sm text-muted-foreground">{q.topic}</p>
                    </div>
                    {solvedSet.has(q._id) ? (
                      <div className="flex items-center gap-2 text-green-500">
                        <CheckCircle size={18} />
                        <span className="font-semibold">Solved</span>
                      </div>
                    ) : (
                      <Link to={`/problem/${q._id}`}><Button variant="outline">Solve</Button></Link>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center text-muted-foreground pt-10">
                {loading ? "Loading..." : "Select a topic and difficulty to see questions here."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;