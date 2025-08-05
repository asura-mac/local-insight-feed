import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-dark-text-secondary mb-4">Page Not Found</h2>
            <p className="text-dark-text-muted mb-8">The page you're looking for doesn't exist.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-dark-accent hover:bg-dark-accent-hover transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
