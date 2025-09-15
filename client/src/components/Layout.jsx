import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ThemeToggle } from "@/components/ThemeToggle";

const Layout = ({ children }) => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen w-full font-sans bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold">
            <svg 
              className="h-6 w-6 text-cyan-500 flex-shrink-0"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            DSA_Challenger
          </Link>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Home
            </Link>
            
            {token ? (
              // --- SHOW THESE IF LOGGED IN ---
              <>
                <Link to="/dashboard" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Log Out
                </button>
              </>
            ) : (
              // --- SHOW THESE IF LOGGED OUT ---
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                  Log In
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90">
                  Sign Up
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-grow px-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;