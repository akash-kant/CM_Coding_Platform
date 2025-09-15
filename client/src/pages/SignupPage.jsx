import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import authService from '@/services/authService';

export function SignupPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const { name, email, password } = formData;
    const onChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.register(formData); // Sends the full formData, including name
            if (response.data.token) {
                alert('Signup successful! Please log in.');
                navigate('/login');
            }
        } catch (error) {
            alert('Error: ' + error.response.data.msg);
        }
    };

  return (
    <div className="w-full min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full mx-auto rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-card border">
        <h2 className="font-bold text-xl text-foreground">
            Create Your Account
        </h2>
        <p className="text-muted-foreground text-sm max-w-sm mt-2">
            Join the platform to start tracking your progress.
        </p>

        <form className="my-8" onSubmit={onSubmit}>
            <LabelInputContainer className="mb-4">
                <Label htmlFor="name">Username</Label>
                <Input id="name" placeholder="Your Name" type="text" value={name} onChange={onChange} required />
            </LabelInputContainer>
            
            <LabelInputContainer className="mb-4">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" placeholder="you@example.com" type="email" value={email} onChange={onChange} required />
            </LabelInputContainer>

            <LabelInputContainer className="mb-4">
                <Label htmlFor="password">Password</Label>
                <Input id="password" placeholder="••••••••" type="password" value={password} onChange={onChange} required />
            </LabelInputContainer>

            <button
            className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
            type="submit"
            >
            Sign Up &rarr;
            <BottomGradient />
            </button>
        </form>
         <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
                Sign In
            </Link>
        </p>
        </div>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

export default SignupPage;