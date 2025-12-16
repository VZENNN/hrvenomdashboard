"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Karyawan", path: "#" },
  { name: "Penilaian", path: "#" },
  { name: "Struktur Organisasi", path: "#" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black text-white h-screen flex flex-col p-6">
      <h1 className="text-2xl font-bold mb-8">VENOM HR</h1>

      <nav className="flex flex-col gap-2">
        {menu.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`px-4 py-2 rounded transition ${
              pathname === item.path
                ? "bg-gray-800"
                : "hover:bg-gray-700"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>

      <button className="mt-auto bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
        Logout
      </button>
    </aside>
  );
}
