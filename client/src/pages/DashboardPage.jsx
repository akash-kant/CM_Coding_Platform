import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Spotlight } from '@/components/ui/spotlight';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const DashboardPage = () => {
    const { userStats, loading, token } = useAuth();
    const [recent, setRecent] = useState([]);
    const totalQuestions = userStats?.totalQuestions ?? 100;

    useEffect(() => {
        const fetchRecent = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await api.get('/users/submissions?limit=8', config);
                setRecent(data || []);
            } catch (e) {
                // keep silent fail for now
            }
        };
        fetchRecent();
    }, [token]);

    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;
    if (!userStats) return <div className="text-center p-10">Please log in to see your stats.</div>;

    const completionPercentage = Math.min(100, Math.max(0, Math.round((userStats.totalSolved / totalQuestions) * 100)));

    // Graceful fallbacks if certain fields aren't provided yet
    const streakDays = userStats.streakDays ?? 0;
    const weeklyGoal = userStats.weeklyGoal ?? 10;
    const weeklySolved = userStats.weeklySolved ?? Math.min(userStats.totalSolved, weeklyGoal);
    // Gamification: simple level/xp system (1 level per 10 solves, 100 xp per solve)
    const level = Math.max(1, Math.floor(userStats.totalSolved / 10) + 1);
    const xpPerSolve = 100;
    const levelSpanSolves = 10;
    const totalXp = (userStats.totalSolved || 0) * xpPerSolve;
    const currentLevelStartXp = Math.floor((level - 1) * levelSpanSolves * xpPerSolve);
    const nextLevelXpThreshold = level * levelSpanSolves * xpPerSolve;
    const currentLevelXp = Math.max(0, totalXp - currentLevelStartXp);
    const currentLevelProgressPct = Math.min(100, Math.round((currentLevelXp / (nextLevelXpThreshold - currentLevelStartXp)) * 100));
    const badges = userStats.badges ?? [
        { id: 'starter', label: 'Starter', variant: 'secondary' },
        { id: 'sprinter', label: '7-Day Streak', variant: 'default' },
        { id: 'array-ace', label: 'Array Ace', variant: 'outline' },
    ];
    const recentActivity = recent.length > 0 ? recent.map(r => ({
        id: r._id,
        title: r.question?.title || 'Unknown',
        topic: r.question?.topic || '—',
        difficulty: r.question?.difficulty || '—',
        result: r.status
    })) : (userStats.recentActivity ?? []);
    const recommendations = userStats.recommendations ?? [
        { id: 101, title: 'Group Anagrams', topic: 'Hashing', difficulty: 'Medium' },
        { id: 102, title: 'Course Schedule', topic: 'Graph', difficulty: 'Medium' },
        { id: 103, title: 'Word Ladder', topic: 'Graph', difficulty: 'Hard' },
    ];
    const dailyQuests = userStats.dailyQuests ?? [
        { id: 'dq-1', title: 'Solve 3 Easy problems', target: 3, done: Math.min(3, userStats.easySolved ?? 0) },
        { id: 'dq-2', title: 'Maintain 1-day streak', target: 1, done: streakDays ? 1 : 0 },
        { id: 'dq-3', title: 'Solve 1 Graph problem', target: 1, done: 0 },
    ];

    return (
        <div className="container mx-auto py-10 space-y-8">
            {/* Hero - Treasure & Level */}
            <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 p-6 md:p-10">
                <Spotlight className="-top-1/3 left-1/2" />
                <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />
                <div className="relative z-10 grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                            <span className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 bg-clip-text text-transparent">Your Treasure Chest</span>
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-300">⭐</span>
                        </h1>
                        <p className="mt-2 text-muted-foreground max-w-2xl">
                            Every solve adds gold to your chest. Showcase your talent with ranks, badges, and trophies you have earned.
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary">{completionPercentage}% complete</Badge>
                            <Badge variant="outline">{userStats.totalSolved} solved</Badge>
                            <Badge variant="default">{streakDays} day streak</Badge>
                        </div>
                        <div className="mt-6 rounded-xl border bg-background/60 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 text-background shadow">🏆</div>
                                    <div>
                                        <div className="text-sm text-muted-foreground">Level</div>
                                        <div className="text-xl font-bold">{level}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm text-muted-foreground">XP</div>
                                    <div className="font-semibold">{currentLevelXp}/{nextLevelXpThreshold - currentLevelStartXp}</div>
                                </div>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400" style={{ width: `${currentLevelProgressPct}%` }} />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                        <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-amber-200/10 to-amber-500/10 p-4">
                            <div className="absolute -top-8 -right-6 text-7xl opacity-20 select-none">💰</div>
                            <div className="text-sm text-muted-foreground">Milestone Chest</div>
                            <div className="mt-1 text-2xl font-bold">{completionPercentage >= 50 ? 'Silver Chest' : 'Bronze Chest'}</div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${completionPercentage}%` }} />
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">Course completion</div>
                                <Button size="sm" variant={completionPercentage >= 50 ? 'default' : 'outline'} className={completionPercentage >= 50 ? 'animate-pulse' : ''}>
                                    {completionPercentage >= 50 ? 'Claim Reward' : 'Keep Going'}
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Button variant="secondary" className="w-full">Continue Practice</Button>
                            <Button variant="outline" className="w-full">View Problems</Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats - minimal strip */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/5 to-transparent">
                    <div className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-cyan-400/15 blur-2xl" />
                    <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Total Solved</div>
                        <div className="mt-1 text-3xl font-bold tracking-tight">{userStats.totalSolved}</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-cyan-500" style={{ width: `${Math.min(100, Math.round((userStats.totalSolved / totalQuestions) * 100))}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-emerald-400/15 blur-2xl" />
                    <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Completion</div>
                        <div className="mt-1 text-3xl font-bold tracking-tight">{completionPercentage}%</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-emerald-500" style={{ width: `${completionPercentage}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden bg-gradient-to-br from-amber-500/5 to-transparent">
                    <div className="pointer-events-none absolute -top-6 -left-6 h-20 w-20 rounded-full bg-amber-400/15 blur-2xl" />
                    <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Medium Solved</div>
                        <div className="mt-1 text-3xl font-bold tracking-tight">{userStats.mediumSolved}</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, Math.round((userStats.mediumSolved / 40) * 100))}%` }} />
                        </div>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden bg-gradient-to-br from-rose-500/5 to-transparent">
                    <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-rose-400/15 blur-2xl" />
                    <CardContent className="p-5">
                        <div className="text-sm text-muted-foreground">Hard Solved</div>
                        <div className="mt-1 text-3xl font-bold tracking-tight">{userStats.hardSolved}</div>
                        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                            <div className="h-full bg-rose-500" style={{ width: `${Math.min(100, Math.round((userStats.hardSolved / 30) * 100))}%` }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Streaks, Topic Chart & Goals - simplified */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="relative overflow-hidden lg:col-span-2 bg-gradient-to-br from-cyan-500/5 to-transparent">
                    <div className="pointer-events-none absolute -top-8 -left-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                    <CardHeader>
                        <CardTitle>Topics Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={userStats.solvedByTopic}
                                    dataKey="count"
                                    nameKey="topic"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                >
                                    {(userStats.solvedByTopic || []).map((entry, index) => {
                                        const colors = ['#22d3ee', '#34d399', '#f59e0b', '#a78bfa', '#f43f5e', '#60a5fa', '#14b8a6'];
                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                    })}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/5 to-transparent">
                    <div className="pointer-events-none absolute -bottom-8 -right-10 h-28 w-28 rounded-full bg-purple-400/10 blur-3xl" />
                    <CardHeader>
                        <CardTitle>Streak & Weekly Goal</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">Current Streak</div>
                                <div className="font-semibold">{streakDays} days</div>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${Math.min(100, Math.max(0, (streakDays / 30) * 100))}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-muted-foreground">Weekly Goal</div>
                                <div className="font-semibold">{weeklySolved}/{weeklyGoal}</div>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div className="h-full bg-gradient-to-r from-emerald-500 to-lime-500" style={{ width: `${Math.min(100, Math.max(0, (weeklySolved / weeklyGoal) * 100))}%` }} />
                            </div>
                        </div>
                        <Button className="w-full" variant="secondary">Solve One More</Button>
                    </CardContent>
                </Card>
            </div>

            {/* Trophy Shelf (Badges) */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-400/5 via-transparent to-pink-400/5">
                <div className="pointer-events-none absolute -top-12 -right-16 h-36 w-36 rounded-full bg-pink-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-14 -left-16 h-36 w-36 rounded-full bg-emerald-400/15 blur-3xl" />
                <CardHeader>
                    <CardTitle>Trophy Shelf</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {badges.map(b => (
                            <div key={b.id} className="relative rounded-lg border p-3 text-center transition hover:shadow-lg bg-background/60">
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl">🏅</div>
                                <div className="mt-4">
                                    <Badge variant={b.variant}>{b.label}</Badge>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground">Rarity: {b.variant === 'destructive' ? 'Legendary' : b.variant === 'default' ? 'Epic' : b.variant === 'outline' ? 'Rare' : 'Common'}</div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Activity, Quests & Recommendations */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Activity - compact list */}
                <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/5 to-transparent">
                    <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recent Activity</CardTitle>
                        <Button size="sm" variant="ghost">View all</Button>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {(recentActivity || []).slice(0, 5).map(row => (
                                <li key={row.id} className="flex items-center justify-between gap-3 rounded-md border bg-background/50 p-3">
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">{row.title}</div>
                                        <div className="text-xs text-muted-foreground truncate">{row.topic} • {row.difficulty}</div>
                                    </div>
                                    <Badge variant={row.result === 'Accepted' ? 'secondary' : 'outline'}>{row.result}</Badge>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Daily Quests - concise */}
                <Card className="relative overflow-hidden xl:col-span-1 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <div className="pointer-events-none absolute -bottom-10 -right-10 h-28 w-28 rounded-full bg-purple-400/10 blur-3xl" />
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Daily Quests</CardTitle>
                        <Button size="sm" variant="ghost">View all</Button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {(dailyQuests || []).slice(0, 3).map(q => {
                            const pct = Math.min(100, Math.round((q.done / q.target) * 100));
                            return (
                                <div key={q.id} className="rounded-md border bg-background/50 p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium truncate">{q.title}</div>
                                        <div className="text-xs text-muted-foreground">{q.done}/{q.target}</div>
                                    </div>
                                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                        <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${pct}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                        <Button className="w-full" variant="secondary">Start Quest</Button>
                    </CardContent>
                </Card>

                {/* Recommendations - compact list */}
                <Card className="relative overflow-hidden xl:col-span-1 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <div className="pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-400/10 blur-3xl" />
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Recommended</CardTitle>
                        <Button size="sm" variant="ghost">View all</Button>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {(recommendations || []).slice(0, 4).map(row => (
                                <li key={row.id} className="flex items-center justify-between gap-3 rounded-md border bg-background/50 p-3">
                                    <div className="min-w-0">
                                        <div className="truncate font-medium">{row.title}</div>
                                        <div className="text-xs text-muted-foreground truncate">{row.topic} • {row.difficulty}</div>
                                    </div>
                                    <Button size="sm">Solve</Button>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;