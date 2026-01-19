import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">VENOM HR SYSTEM</h1>
        <p className="text-gray-600 mb-6">
          Human Resource Management System
        </p>

        <Link
          href="/login"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-800"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
