
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthProvider";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle } from "lucide-react";

interface UserLocationData {
  location?: string;
  state?: string;
  district?: string;
}

export function Header() {
  const { user, signOut } = useAuth();
  const [userLocation, setUserLocation] = useState<UserLocationData | null>(null);
  
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('users')
          .select('location, state, district')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setUserLocation(data);
        }
      } catch (error) {
        console.error("Error fetching user location:", error);
      }
    };
    
    fetchUserLocation();
  }, [user]);

  return (
    <header className="border-b border-gray-800 bg-[#1A1A1A]">
      <div className="flex h-16 items-center px-4 md:px-6 container mx-auto">
        <Link to="/" className="flex items-center space-x-2">
          <AlertTriangle size={24} className="text-[#D32F2F]" />
          <span className="font-bold text-lg text-white">Alert Hub</span>
        </Link>
        
        {user && userLocation?.location && (
          <div className="hidden md:flex ml-6 items-center">
            <span className="text-xs px-2 py-1 rounded bg-[#333] border border-gray-700 text-gray-300">
              {userLocation.district ? `${userLocation.district}, ${userLocation.state}` : userLocation.location}
            </span>
          </div>
        )}
        
        <div className="ml-auto flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#D32F2F] text-white">
                    {user.email ? user.email.charAt(0).toUpperCase() : "U"}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#222] text-white border-gray-800">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuLabel className="text-xs font-normal text-gray-400 truncate">{user.email}</DropdownMenuLabel>
                {userLocation?.location && (
                  <>
                    <DropdownMenuSeparator className="bg-gray-800" />
                    <DropdownMenuLabel className="text-xs font-normal text-gray-400">
                      {userLocation.location}
                    </DropdownMenuLabel>
                  </>
                )}
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem asChild className="text-white hover:bg-[#333] hover:text-white focus:bg-[#333] focus:text-white">
                  <Link to="/profile">Profile Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-white hover:bg-[#333] hover:text-white focus:bg-[#333] focus:text-white">
                  <Link to="/alerts">My Alerts</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-800" />
                <DropdownMenuItem 
                  onClick={() => signOut()} 
                  className="text-white hover:bg-[#333] hover:text-white focus:bg-[#333] focus:text-white"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-4">
              <Button variant="ghost" asChild className="text-white hover:bg-[#333] hover:text-white">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-[#D32F2F] hover:bg-[#B71C1C] text-white">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
