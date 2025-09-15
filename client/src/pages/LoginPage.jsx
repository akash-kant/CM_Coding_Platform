import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import authService from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;
    const onChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(formData);
            if (response.data.token) {
                login(response.data.token);
                navigate('/dashboard'); // Go to dashboard after login
            }
        } catch (error) {
            alert('Error: ' + (error.response?.data?.msg || 'Login failed'));
        }
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center">
            <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-card border">
                <h2 className="font-bold text-xl text-foreground">Welcome Back</h2>
                <form className="my-8" onSubmit={onSubmit}>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" placeholder="you@example.com" type="email" value={email} onChange={onChange} required />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" placeholder="••••••••" type="password" value={password} onChange={onChange} required />
                    </LabelInputContainer>
                    <button className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-input" type="submit">
                        Sign In &rarr;
                    </button>
                </form>
                <p className="text-center text-sm text-muted-foreground">
                    No account?{' '}
                    <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}
const LabelInputContainer = ({ children, className }) => (<div className={cn("flex flex-col space-y-2 w-full", className)}>{children}</div>);
export default LoginPage;