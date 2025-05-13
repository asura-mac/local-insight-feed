
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center py-12 px-4 bg-[#1A1A1A]">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#D32F2F]">Alert Hub</h1>
        <p className="mt-2 text-gray-400">Create your account to get started</p>
      </div>
      <RegisterForm />
    </div>
  );
}
