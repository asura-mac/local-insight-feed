
import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A] text-white">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
      <footer className="py-4 px-6 border-t border-gray-800 text-center text-gray-400 text-sm">
        <div className="container mx-auto">
          <p>Powered by AlertHub | Location data via Nominatim OpenStreetMap</p>
        </div>
      </footer>
    </div>
  );
}
