import { prisma } from "@/lib/prisma";
import { User, Gender } from "@prisma/client";
import { Trophy, Users, UserCheck, Mars, Venus } from "lucide-react";
import OverviewChart from "@/components/dashboard/OverviewChart";

async function getDashboardData() {
  const totalEmployees = await prisma.user.count({ where: { status: "ACTIVE" } });

  const maleCount = await prisma.user.count({
    where: { status: "ACTIVE", gender: "MALE" }
  });

  const femaleCount = await prisma.user.count({
    where: { status: "ACTIVE", gender: "FEMALE" }
  });

  // Top Scorer Logic (Current Month)
  const currentDate = new Date();
  const topScorerEvaluation = await prisma.evaluation.findFirst({
    where: {
      month: currentDate.getMonth() + 1, // JS Month is 0-indexed
      year: currentDate.getFullYear()
    },
    orderBy: {
      finalScore: 'desc'
    },
    include: {
      user: {
        include: { department: true }
      }
    }
  });

  // Chart Data Aggregation (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

  const evaluations = await prisma.evaluation.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo }
    },
    select: { month: true, year: true, finalScore: true }
  });

  const chartData = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();

    const monthlyEvals = evaluations.filter(e => e.month === m && e.year === y);
    const avg = monthlyEvals.length > 0
      ? monthlyEvals.reduce((a, b) => a + b.finalScore, 0) / monthlyEvals.length
      : 0;

    chartData.unshift({
      month: d.toLocaleString('default', { month: 'short' }),
      score: Number(avg.toFixed(2))
    });
  }

  return { totalEmployees, maleCount, femaleCount, topScorer: topScorerEvaluation, chartData };
}

export default async function DashboardPage() {
  const { totalEmployees, maleCount, femaleCount, topScorer, chartData } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome back to VENOM HR System.</p>
      </div>

      {/* Stats Grid - UNCHANGED */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Employees"
          value={totalEmployees}
          icon={Users}
          color="blue"
          subtext="Active Personnel"
        />
        <StatCard
          title="Male Employees"
          value={maleCount}
          icon={Mars}
          color="indigo"
          subtext={`${((maleCount / totalEmployees) * 100 || 0).toFixed(0)}% of workforce`}
        />
        <StatCard
          title="Female Employees"
          value={femaleCount}
          icon={Venus}
          color="pink"
          subtext={`${((femaleCount / totalEmployees) * 100 || 0).toFixed(0)}% of workforce`}
        />
      </div>

      {/* Top Scorer Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Scorer Card - UNCHANGED */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 text-amber-500 font-bold uppercase tracking-wider text-sm">
              <Trophy size={18} /> Employee of the Month
            </div>

            {topScorer ? (
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-amber-100 dark:ring-amber-900">
                  {topScorer.user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{topScorer.user.name}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-3">{topScorer.user.position} • {topScorer.user.department?.name}</p>
                  <div className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1 rounded-full font-bold text-lg">
                    Score: {topScorer.finalScore.toFixed(2)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic py-8">
                No evaluations found for this month yet.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions or Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Performance Trends</h3>
          <p className="text-slate-500 text-sm mb-6">Average score (last 6 months).</p>
          <OverviewChart data={chartData} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, subtext }: any) {
  const colorStyles: any = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    pink: "bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400",
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorStyles[color] || colorStyles.blue}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
