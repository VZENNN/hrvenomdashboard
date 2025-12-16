import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">VENOM HR Dashboard</h1>
        <p className="text-gray-600 mb-6">
          Human Resource Performance & KPI Management System
        </p>

        <Link
          href="/login"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800"
        >
          Login HR Manager
        </Link>
      </div>
    </div>
  );
}
