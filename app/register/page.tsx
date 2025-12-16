"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    gender: "MALE", 
    position: "",
    role: "EMPLOYEE", 
    joinDate: new Date().toISOString().split('T')[0] 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal mendaftar");
      }

      alert("Berhasil membuat akun karyawan!");
      router.push("/login");
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-[480px]">
        <h1 className="text-2xl font-bold mb-1 text-center">Create Employee</h1>
        <p className="text-gray-500 mb-6 text-center text-sm">
          Enter employee data to create an account
        </p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* NIK & Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Employee ID (NIK)</label>
              <input
                name="employeeId"
                type="text"
                required
                placeholder="Ex: IT-001"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                placeholder="John Doe"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="email@company.com"
              className="w-full border px-3 py-2 rounded text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              placeholder="******"
              className="w-full border px-3 py-2 rounded text-sm"
              onChange={handleChange}
            />
          </div>

          {/* Position & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Position</label>
              <input
                name="position"
                type="text"
                required
                placeholder="Ex: Staff"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
                value={formData.gender}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Role & Join Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
              <select
                name="role"
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
                value={formData.role}
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Join Date</label>
              <input
                name="joinDate"
                type="date"
                required
                className="w-full border px-3 py-2 rounded text-sm"
                onChange={handleChange}
                value={formData.joinDate}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2.5 rounded mt-6 hover:bg-gray-800 transition disabled:bg-gray-400"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>
    </div>
  );
}