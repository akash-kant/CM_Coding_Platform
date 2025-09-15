import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DashboardPage = () => {
    const { userStats, loading } = useAuth();
    const totalQuestions = 100; // You can make this dynamic later

    if (loading) return <div className="text-center p-10">Loading Dashboard...</div>;
    if (!userStats) return <div className="text-center p-10">Please log in to see your stats.</div>;

    const completionPercentage = Math.round((userStats.totalSolved / totalQuestions) * 100);

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-4xl font-bold mb-8">Your Progress Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card><CardHeader><CardTitle className="text-center">Total Solved</CardTitle></CardHeader><CardContent className="p-6"><CircularProgressbar value={userStats.totalSolved} maxValue={totalQuestions} text={`${userStats.totalSolved}`} styles={buildStyles({ textColor: '#fff', pathColor: '#0ea5e9', trailColor: '#334155' })} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-center">Completion</CardTitle></CardHeader><CardContent className="p-6"><CircularProgressbar value={completionPercentage} text={`${completionPercentage}%`} styles={buildStyles({ textColor: '#fff', pathColor: '#22c55e', trailColor: '#334155' })} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-center">Medium Solved</CardTitle></CardHeader><CardContent className="p-6"><CircularProgressbar value={userStats.mediumSolved} maxValue={40} text={`${userStats.mediumSolved}`} styles={buildStyles({ textColor: '#fff', pathColor: '#f97316', trailColor: '#334155' })} /></CardContent></Card>
                <Card><CardHeader><CardTitle className="text-center">Hard Solved</CardTitle></CardHeader><CardContent className="p-6"><CircularProgressbar value={userStats.hardSolved} maxValue={30} text={`${userStats.hardSolved}`} styles={buildStyles({ textColor: '#fff', pathColor: '#ef4444', trailColor: '#334155' })} /></CardContent></Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Problems Solved by Topic</CardTitle></CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={userStats.solvedByTopic} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis dataKey="topic" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155'}} />
                            <Bar dataKey="count" fill="#0ea5e9" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
};

export default DashboardPage;