"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-700">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-purple-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 text-sm">Sign in to VENOM HR System</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="admin@venom.com"
              className="w-full border border-slate-300 dark:border-slate-600 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:bg-slate-900"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              placeholder="••••••"
              className="w-full border border-slate-300 dark:border-slate-600 px-4 py-3 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none dark:bg-slate-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-purple-200 dark:shadow-none flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin text-white" /> : "Sign In"}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Protected Global HR System © 2025
        </p>
      </div>
    </div>
  );
}
