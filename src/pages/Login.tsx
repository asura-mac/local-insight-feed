import { LoginForm } from "@/components/auth/LoginForm";
import { Layout } from "@/components/layout/Layout";

export default function Login() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
              <p className="text-dark-text-secondary">Sign in to your Satark account</p>
            </div>
            <LoginForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
