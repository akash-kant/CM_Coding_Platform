import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Flame, Star, Clock, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/api/axios';

const HomePage = () => {
  const { solvedSet, userStats } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [daily, setDaily] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [topicQuery, setTopicQuery] = useState('');
  const [showAllTopics, setShowAllTopics] = useState(false);
  const [showQuick, setShowQuick] = useState(false);
  const [quickTopic, setQuickTopic] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);

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
    const fetchDaily = async () => {
      try {
        const { data } = await api.get('/questions/daily');
        setDaily(data);
      } catch (error) {
        console.error('Failed to fetch daily question', error);
      }
    };
    fetchAllTopics();
    fetchDaily();
  }, []);

  const handleGenerate = async (topicOverride, difficultyOverride) => {
    const topic = topicOverride ?? selectedTopic;
    const difficulty = difficultyOverride ?? selectedDifficulty;
    if (!topic || !difficulty) {
      alert("Please select a topic and a difficulty.");
      return;
    }
    setLoading(true);
    setFilteredQuestions([]);
    try {
      const { data } = await api.get(`/questions?topic=${encodeURIComponent(topic)}&difficulty=${encodeURIComponent(difficulty)}`);
      setFilteredQuestions(data);
    } catch (error) {
      console.error("Failed to fetch filtered questions", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      {/* Hero - simple, fast, and clean */}
      <div className="relative overflow-hidden rounded-xl border mb-10 glass-panel glass-accent">
        <div className="px-6 py-10 md:py-14 lg:px-10 bg-gradient-to-r from-primary/10 via-accent/5 to-transparent">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
              Level up with <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">Coding Mirchi</span>
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              High-signal DSA problems, fast editor, and a playful streak system. Stay spicy.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button onClick={() => { setShowQuick(true); }}>Spice It Up</Button>
              <a href="#generator" className="text-sm font-medium text-primary hover:underline">Choose filters</a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick stats and daily challenge */}
      <div className="mb-8">
        <div className="glass-panel glass-accent rounded-xl p-5 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: redesigned stats (dynamic from backend) */}
            <div className="flex flex-col gap-5">
              {/* Big streak badge */}
              <div className="flex items-center gap-4">
                <div className="relative h-14 w-14 rounded-full border flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/10">
                  <Flame className="absolute -top-1 -right-1 h-4 w-4 text-orange-400" />
                  <span className="text-xl font-bold">{userStats?.streakDays ?? 0}</span>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Current streak</div>
                  <div className="text-lg font-semibold">{(userStats?.streakDays ?? 0)} days</div>
                </div>
                <div className="ml-auto inline-flex items-center gap-2 rounded-md border px-3 py-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">Weekly target</span>
                  <strong className="text-sm">{userStats?.weeklyGoal ?? 10}</strong>
                </div>
              </div>

              {/* Segmented progress */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2 text-muted-foreground">
                  <span>Weekly progress</span>
                  <span>{(userStats?.weeklySolved ?? 0)} / {(userStats?.weeklyGoal ?? 10)}</span>
                </div>
                <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.max(1, userStats?.weeklyGoal ?? 10)}, minmax(0, 1fr))` }}>
                  {Array.from({ length: Math.max(1, userStats?.weeklyGoal ?? 10) }).map((_, i) => {
                    const filled = i < (userStats?.weeklySolved ?? 0);
                    return (
                      <div key={i} className={`h-2 rounded-sm ${filled ? 'bg-primary' : 'bg-muted'}`} />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: daily challenge (dynamic) */}
            <div className="rounded-lg border p-4 md:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs mb-2 text-muted-foreground">
                    <span className="rounded-full border px-2 py-0.5">Daily</span>
                    {daily?.topic && (<span className="rounded-full border px-2 py-0.5">{daily.topic}</span>)}
                    {daily?.difficulty && (<span className="rounded-full border px-2 py-0.5">{daily.difficulty}</span>)}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-semibold leading-tight">{daily?.title || 'Loading…'}</h3>
                    {daily && <span className="text-[10px] rounded-full border px-2 py-0.5 text-primary border-primary/40">Live</span>}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-xl">{daily?.description || 'Daily challenge will appear here.'}</p>
                </div>
                {daily ? (
                  <Link to={`/problem/${daily._id}`}>
                    <Button className="whitespace-nowrap"><Clock className="mr-2 h-4 w-4" />Start</Button>
                  </Link>
                ) : (
                  <Button className="whitespace-nowrap" disabled><Clock className="mr-2 h-4 w-4" />Loading</Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Topics: search + dense chip grid */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold flex items-center gap-2"><Star className="h-5 w-5 text-amber-400" /> Browse Topics</h2>
          <Link to="/practice" className="text-sm text-primary hover:underline">View all</Link>
        </div>
        <div className="glass-panel glass-accent rounded-xl border p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="w-full md:max-w-sm">
              <Input
                value={topicQuery}
                onChange={(e) => setTopicQuery(e.target.value)}
                placeholder="Search topics..."
              />
            </div>
            <div className="text-xs text-muted-foreground">Tip: Click a topic to set the filter</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {(topics || [])
              .filter(t => t?.toLowerCase().includes(topicQuery.toLowerCase()))
              .slice(0, showAllTopics ? 999 : 18)
              .map((topic) => (
                <button
                  key={topic}
                  onClick={() => {
                    setSelectedTopic(topic);
                    setSelectedDifficulty('Easy');
                    const el = document.getElementById('generator');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Auto-generate results for topic with default difficulty
                    handleGenerate(topic, 'Easy');
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${selectedTopic === topic ? 'bg-primary/15 border-primary text-primary' : 'hover:bg-muted/40'}`}
                >
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="font-medium">{topic}</span>
                </button>
            ))}
            {((topics || []).filter(t => t?.toLowerCase().includes(topicQuery.toLowerCase())).length > 18) && (
              <button
                onClick={() => setShowAllTopics(!showAllTopics)}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm hover:bg-muted/40">
                {showAllTopics ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Generator + Results */}
      <div className="border-t pt-8 mb-10" />
      <div id="generator" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card className="glass-panel glass-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                Find a Challenge
              </CardTitle>
            </CardHeader>
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
              <Button onClick={handleGenerate} disabled={loading} className="w-full">
                {loading ? 'Generating...' : 'Generate Questions'}
              </Button>
              <p className="text-xs text-muted-foreground">Tip: You can also click a topic chip above to prefill.</p>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="min-h-[60vh] glass-panel glass-accent">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Generated Questions</span>
                {filteredQuestions.length > 0 && (
                  <span className="text-sm text-muted-foreground">{filteredQuestions.length} results</span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredQuestions.length > 0 ? (
                <ul className="space-y-3">
                  {filteredQuestions.map(q => (
                    <li key={q._id} className="p-4 rounded-md border flex justify-between items-center hover:border-primary/40 transition-colors">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{q.title}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{q.topic}</Badge>
                          {q.difficulty && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${q.difficulty === 'Easy' ? 'border-emerald-500 text-emerald-300' : q.difficulty === 'Medium' ? 'border-amber-500 text-amber-300' : 'border-red-500 text-red-300'}`}>
                              {q.difficulty}
                            </span>
                          )}
                        </div>
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

      {/* Quick Generate Modal */}
      {showQuick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setShowQuick(false)} />
          <div className="relative z-10 w-[92%] max-w-md rounded-xl border glass-panel glass-accent shadow-xl">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Spice it up with a random challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic</label>
                  <Select value={quickTopic} onValueChange={setQuickTopic}>
                    <SelectTrigger><SelectValue placeholder="Select a topic" /></SelectTrigger>
                    <SelectContent>
                      {topics.map(topic => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button variant="secondary" onClick={() => setShowQuick(false)}>Cancel</Button>
                  <Button disabled={!quickTopic || quickLoading} onClick={async () => {
                    if (!quickTopic) return;
                    setQuickLoading(true);
                    try {
                      const { data } = await api.get(`/questions?topic=${encodeURIComponent(quickTopic)}`);
                      if (!data || data.length === 0) {
                        alert('No questions found for this topic.');
                      } else {
                        const random = data[Math.floor(Math.random() * data.length)];
                        setShowQuick(false);
                        navigate(`/problem/${random._id}`);
                      }
                    } catch (e) {
                      alert('Failed to fetch questions.');
                    } finally {
                      setQuickLoading(false);
                    }
                  }}>{quickLoading ? 'Cooking…' : 'Spice It Up'}</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;