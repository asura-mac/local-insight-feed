
import { ReactNode } from "react";
import Header from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A]">
      <Header />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 md:pl-64 pt-16 min-h-[calc(100vh-4rem)]">
          <div className="container mx-auto px-4 py-6 flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
