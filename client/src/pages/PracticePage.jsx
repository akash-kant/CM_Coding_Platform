import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/api/axios';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/context/AuthContext';
import { Spotlight } from '@/components/ui/spotlight';

const PracticePage = () => {
  const navigate = useNavigate();
  const { solvedSet } = useAuth();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UX state
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('default'); // default | title | difficulty
  const [sortDir, setSortDir] = useState('asc'); // asc | desc

  useEffect(() => {
    // Fetch data when the component mounts
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get('/questions');
        setQuestions(data);
      } catch (err) {
        setError('Failed to load questions. Please make sure the server is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []); // Empty array ensures this runs only once

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-800 text-green-300 border-green-600">Easy</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-800 text-yellow-300 border-yellow-600">Medium</Badge>;
      case 'hard':
        return <Badge variant="outline" className="bg-red-800 text-red-300 border-red-600">Hard</Badge>;
      default:
        return <Badge variant="secondary">{difficulty}</Badge>;
    }
  };

  const topics = useMemo(() => {
    const set = new Set(questions.map(q => q.topic).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [questions]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let result = questions.filter(q => {
      const matchesSearch = !s || q.title.toLowerCase().includes(s) || q.topic.toLowerCase().includes(s);
      const matchesTopic = topicFilter === 'all' || q.topic === topicFilter;
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty.toLowerCase() === difficultyFilter;
      return matchesSearch && matchesTopic && matchesDifficulty;
    });

    if (sortBy !== 'default') {
      result = [...result].sort((a, b) => {
        let cmp = 0;
        if (sortBy === 'title') cmp = a.title.localeCompare(b.title);
        if (sortBy === 'difficulty') {
          const order = { easy: 0, medium: 1, hard: 2 };
          cmp = (order[a.difficulty.toLowerCase()] ?? 99) - (order[b.difficulty.toLowerCase()] ?? 99);
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  }, [questions, search, topicFilter, difficultyFilter, sortBy, sortDir]);

  const solvedCount = useMemo(() => filtered.filter(q => solvedSet?.has(q._id)).length, [filtered, solvedSet]);

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Failed to load</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => { setLoading(true); setError(null); /* trigger reload */ window.location.reload(); }}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-4">
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 p-6 md:p-8">
        <Spotlight className="-top-1/3 left-1/2" />
        <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Practice</h1>
            <p className="text-muted-foreground">Sharpen your skills with curated problems.</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="bg-green-700/20 text-green-300 border-green-600">Solved {solvedCount}/{filtered.length}</Badge>
            <Badge variant="outline">Total {questions.length}</Badge>
          </div>
        </div>
      </div>

      <Card className="relative overflow-hidden mb-4 bg-gradient-to-br from-cyan-500/5 to-transparent">
        <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-2xl" />
        <CardHeader className="py-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex-1 min-w-[220px]">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or topic" />
          </div>
          <div className="w-[200px]">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger><SelectValue placeholder="Topic" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Topics</SelectItem>
                {topics.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger><SelectValue placeholder="Difficulty" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[180px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger><SelectValue placeholder="Sort by" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="difficulty">Difficulty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[140px]">
            <Select value={sortDir} onValueChange={setSortDir}>
              <SelectTrigger><SelectValue placeholder="Order" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="secondary" onClick={() => { setSearch(''); setTopicFilter('all'); setDifficultyFilter('all'); setSortBy('default'); setSortDir('asc'); }}>Clear</Button>
        </CardContent>
      </Card>

      <div className="relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="pointer-events-none absolute -top-12 -right-16 h-36 w-36 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-16 h-36 w-36 rounded-full bg-rose-400/10 blur-3xl" />
        <Table>
          <TableHeader>
            <TableRow className="bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0">
              <TableHead className="w-[110px]">Status</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Difficulty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-24 bg-muted animate-pulse rounded" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-20 bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4}>
                  <div className="text-center py-10 text-muted-foreground">No problems match your filters.</div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((question) => {
                const isSolved = solvedSet?.has(question._id);
                return (
                  <TableRow key={question._id} className="cursor-pointer hover:bg-accent/30" onClick={() => navigate(`/problem/${question._id}`)}>
                    <TableCell>
                      {isSolved ? (
                        <Badge variant="outline" className="bg-green-700/20 text-green-300 border-green-600">Solved</Badge>
                      ) : (
                        <Badge variant="secondary">Unsolved</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{question.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">{question.topic}</Badge>
                    </TableCell>
                    <TableCell>{getDifficultyBadge(question.difficulty)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PracticePage;