import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '@/api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('userToken'));
    const [userStats, setUserStats] = useState(null);
    const [solvedSet, setSolvedSet] = useState(new Set());
    const [loading, setLoading] = useState(true);

    const fetchUserProgress = async (currentToken) => {
        if (!currentToken) {
            setUserStats(null);
            setSolvedSet(new Set());
            return;
        }
        try {
            const config = { headers: { Authorization: `Bearer ${currentToken}` } };
            const [statsRes, progressRes] = await Promise.all([
                api.get('/users/stats', config),
                api.get('/users/progress', config)
            ]);
            setUserStats(statsRes.data);
            setSolvedSet(new Set(progressRes.data));
        } catch (error) {
            console.error("Failed to fetch user progress, logging out.", error);
            logout(); // If token is invalid or server fails, log the user out
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            if (token) {
                await fetchUserProgress(token);
            }
            setLoading(false);
        };
        initializeAuth();
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('userToken', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('userToken');
        setToken(null);
        setUserStats(null);
        setSolvedSet(new Set());
    };

    return (
        <AuthContext.Provider value={{ token, userStats, solvedSet, loading, login, logout, fetchUserProgress }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};