
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const location = useLocation();
  
  const links = [
    { name: "My Alerts", href: "/alerts", icon: "alert" },
    { name: "Notifications", href: "/notifications", icon: "bell" },
    { name: "Profile", href: "/profile", icon: "user" },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 pt-16">
      <div className="flex-1 flex flex-col min-h-0 border-r bg-[#1A1A1A] border-gray-800">
        <nav className="px-2 pt-6 space-y-1">
          {links.map((link) => {
            const isActive = link.href === '/' 
              ? location.pathname === link.href
              : location.pathname.startsWith(link.href);
            
            return (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-md",
                  isActive
                    ? "bg-[#D32F2F] text-white"
                    : "text-gray-300 hover:bg-[#333]"
                )}
              >
                <span className="mr-3">{renderIcon(link.icon, isActive)}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function renderIcon(icon: string, isActive: boolean) {
  const className = isActive ? "text-white" : "text-gray-400";
  
  switch (icon) {
    case "alert":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "bell":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "user":
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      );
    default:
      return null;
  }
}
