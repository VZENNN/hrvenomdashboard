"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // nanti diganti JWT auth
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-[350px]"
      >
        <h1 className="text-2xl font-bold mb-1">VENOM HR</h1>
        <p className="text-gray-500 mb-6">Login HR Manager</p>

        <input
          type="email"
          placeholder="Email"
          className="w-full border px-3 py-2 rounded mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border px-3 py-2 rounded mb-6"
          required
        />

        <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800">
          Login
        </button>
      </form>
    </div>
  );
}
