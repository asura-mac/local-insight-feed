import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BellRing, Menu, X } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Function to get user initial for avatar
  const getUserInitial = () => {
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg bg-dark-surface border-b border-dark-border">
      <div className="container flex h-16 items-center justify-between px-4 md:px-0">
        {/* Left: Logo + Brand */}
        <Link to="/" className="flex items-center space-x-2" onClick={() => setMobileMenuOpen(false)}>
          <img
            src="/satark_logo.png"
            alt="Satark Logo"
            className="h-8 w-auto sm:h-10 object-contain"
            style={{ maxWidth: 40 }}
          />
          <span className="font-bold text-lg text-dark-text-primary tracking-tight">Satark</span>
        </Link>
        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-8">
          <Link
            to="/"
            className={cn(
              "transition-colors px-2 py-1 rounded hover:bg-dark-surface-light hover:text-dark-accent font-medium text-dark-text-secondary",
              location.pathname === "/" ? "text-dark-accent bg-dark-surface-light" : ""
            )}
          >
            Home
          </Link>
          <Link
            to="/alerts"
            className={cn(
              "transition-colors px-2 py-1 rounded hover:bg-dark-surface-light hover:text-dark-accent font-medium text-dark-text-secondary",
              location.pathname === "/alerts" ? "text-dark-accent bg-dark-surface-light" : ""
            )}
          >
            Alerts
          </Link>
          <Link
            to="/about"
            className={cn(
              "transition-colors px-2 py-1 rounded hover:bg-dark-surface-light hover:text-dark-accent font-medium text-dark-text-secondary",
              location.pathname === "/about" ? "text-dark-accent bg-dark-surface-light" : ""
            )}
          >
            About
          </Link>
        </nav>
        {/* Right: CTA/User */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/alerts">
            <Button variant="default" size="sm" className="bg-dark-accent hover:bg-dark-accent-hover text-white shadow">
              View Alerts
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8 bg-dark-accent text-white">
                    <AvatarFallback>
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-dark-surface border-dark-border">
                <DropdownMenuItem className="text-dark-text-primary hover:bg-dark-surface-light">
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-dark-border" />
                <DropdownMenuItem onClick={() => signOut()} className="text-dark-text-primary hover:bg-dark-surface-light">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="bg-dark-accent hover:bg-dark-accent-hover text-white">
                Sign In
              </Button>
            </Link>
          )}
        </div>
        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-dark-accent text-dark-text-primary"
          onClick={() => setMobileMenuOpen((v) => !v)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setMobileMenuOpen(false)}>
            <div className="absolute top-0 right-0 w-64 h-full bg-dark-surface shadow-lg flex flex-col p-6 space-y-4 animate-slide-in border-l border-dark-border">
              <button className="self-end mb-4 text-dark-text-primary" onClick={() => setMobileMenuOpen(false)} aria-label="Close menu">
                <X className="h-6 w-6" />
              </button>
              <Link to="/" className="font-medium text-dark-text-primary hover:text-dark-accent" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              <Link to="/alerts" className="font-medium text-dark-text-primary hover:text-dark-accent" onClick={() => setMobileMenuOpen(false)}>
                Alerts
              </Link>
              <Link to="/about" className="font-medium text-dark-text-primary hover:text-dark-accent" onClick={() => setMobileMenuOpen(false)}>
                About
              </Link>
              <Link to="/alerts" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="default" size="sm" className="w-full mt-4 bg-dark-accent hover:bg-dark-accent-hover text-white">
                  View Alerts
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
