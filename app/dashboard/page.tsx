import Sidebar from "@/components/sidebar";

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Total Karyawan</p>
            <h2 className="text-3xl font-bold">120</h2>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Pria</p>
            <h2 className="text-3xl font-bold">70</h2>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <p className="text-gray-500">Wanita</p>
            <h2 className="text-3xl font-bold">50</h2>
          </div>

          <div className="bg-white p-6 rounded shadow flex flex-col items-center">
            <p className="text-gray-500 mb-2">Top Scorer Bulan Ini</p>
            <img
              src="/avatar.png"
              className="w-16 h-16 rounded-full mb-2"
            />
            <h3 className="font-semibold">Andi Wijaya</h3>
            <span className="text-sm text-green-600">95 Poin</span>
          </div>
        </div>
      </main>
    </div>
  );
}
