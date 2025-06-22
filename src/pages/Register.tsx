import { RegisterForm } from "@/components/auth/RegisterForm";
import { Layout } from "@/components/layout/Layout";

export default function Register() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-dark-text-primary mb-2">Create Account</h1>
              <p className="text-dark-text-secondary">Join Satark to stay informed about emergencies</p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </Layout>
  );
}
