
import React from "react";
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
import { BellRing } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();

  // Function to get user initial for avatar
  const getUserInitial = () => {
    if (!user?.email) return '?';
    return user.email[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              LocalInsight Feed
            </span>
          </Link>
          <nav className="flex items-center space-x-4 text-sm font-medium">
            <Link
              to="/"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link
              to="/alerts"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/alerts"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              Alerts
            </Link>
            <Link
              to="/notifications"
              className={cn(
                "transition-colors hover:text-foreground/80",
                location.pathname === "/notifications"
                  ? "text-foreground"
                  : "text-foreground/60"
              )}
            >
              <div className="flex items-center">
                <BellRing className="mr-1 h-4 w-4" />
                Notifications
              </div>
            </Link>
          </nav>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Link to="/notifications">
            <Button variant="ghost" size="sm" className="mr-2">
              <BellRing className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </Link>
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8 bg-primary text-white">
                    <AvatarFallback>
                      {getUserInitial()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
