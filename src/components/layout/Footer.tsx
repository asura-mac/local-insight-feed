
import { AlertTriangle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#1A1A1A] border-t border-gray-800 py-4 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <AlertTriangle size={18} className="text-[#D32F2F] mr-2" />
          <span className="text-sm text-gray-400">Alert Hub - Emergency Alert System</span>
        </div>
        
        <div className="text-xs text-gray-500">
          <p>Powered by OpenStreetMap Nominatim & RSSHub</p>
          <p>&copy; {new Date().getFullYear()} Alert Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
