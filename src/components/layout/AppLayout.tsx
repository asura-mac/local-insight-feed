import { ReactNode } from "react";
import { Layout } from "./Layout";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {children}
      </div>
    </Layout>
  );
}
