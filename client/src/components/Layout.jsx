import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50 glass-panel glass-accent relative">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="group flex items-center gap-2 text-xl font-extrabold">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-primary/30 to-accent/30">
              <span className="absolute inset-0 rounded-md ring-1 ring-primary/30" />
              <svg
                className="h-4 w-4 text-primary"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 2c-1.933 0-3.5 1.567-3.5 3.5 0 .63.164 1.224.45 1.737C6.76 8.07 5 10.32 5 13c0 3.314 2.686 6 6 6 4.418 0 8-3.582 8-8 0-3.866-3.134-7-7-7h.5z"/>
              </svg>
            </span>
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-amber-300 bg-clip-text text-transparent">Coding Mirchi</span>
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/" className={({isActive}) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-primary bg-muted/40 ring-1 ring-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-muted/40'}`}>
              Home
            </NavLink>
            <NavLink to="/practice" className={({isActive}) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-primary bg-muted/40 ring-1 ring-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-muted/40'}`}>
              Practice
            </NavLink>
            
            {token ? (
              // --- SHOW THESE IF LOGGED IN ---
              <>
                <NavLink to="/dashboard" className={({isActive}) => `px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive ? 'text-primary bg-muted/40 ring-1 ring-primary/20' : 'text-muted-foreground hover:text-primary hover:bg-muted/40'}`}>
                  Dashboard
                </NavLink>
                <button onClick={handleLogout} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-md hover:bg-muted/40">
                  Log Out
                </button>
              </>
            ) : (
              // --- SHOW THESE IF LOGGED OUT ---
              <>
                <Link to="/login" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary rounded-md hover:bg-muted/40">
                  Log In
                </Link>
                <Link to="/signup" className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 shadow-sm">
                  Sign Up
                </Link>
              </>
            )}
            <ThemeToggle />
          </nav>
        </div>
      </header>
      <main className="container mx-auto flex-grow px-2">
        {children}
      </main>
    </div>
  );
};

export default Layout;