
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary">Alert Hub</h1>
        <p className="mt-2 text-gray-600">Create your account to get started</p>
      </div>
      <RegisterForm />
    </div>
  );
}
