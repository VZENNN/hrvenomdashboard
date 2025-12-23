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

  // Top 3 Scorers Logic (Current Month)
  const currentDate = new Date();
  const topScorersEvaluation = await prisma.evaluation.findMany({
    where: {
      month: currentDate.getMonth() + 1, // JS Month is 0-indexed
      year: currentDate.getFullYear()
    },
    orderBy: {
      finalScore: 'desc'
    },
    take: 3,
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

  return { totalEmployees, maleCount, femaleCount, topScorers: topScorersEvaluation, chartData };
}

import { auth } from "@/auth";

// ... (getDashboardData function remains same)

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || 'User';

  const { totalEmployees, maleCount, femaleCount, topScorers, chartData } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">Welcome back, <span className="font-semibold text-slate-900 dark:text-white">{userName}</span>! Here's what's happening today.</p>
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

      {/* Top Scorers Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top 3 Scorers Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Trophy size={300} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6 text-amber-500 font-bold uppercase tracking-wider text-sm">
              <Trophy size={50} /> Employees Of The Month
            </div>

            {topScorers && topScorers.length > 0 ? (
              <div className="space-y-4">
                {topScorers.map((scorer, index) => (
                  <div key={scorer.id} className={`flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0 animate-slide-in-up opacity-0 stagger-${index + 1}`} style={{ animationFillMode: 'forwards' }}>
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg transition-transform duration-300 hover:scale-110 ${index === 0 ? 'bg-gradient-to-tr from-amber-400 to-amber-600' :
                        index === 1 ? 'bg-gradient-to-tr from-slate-300 to-slate-400' :
                          'bg-gradient-to-tr from-orange-400 to-orange-600'
                        } shadow-lg ring-2 ${index === 0 ? 'ring-amber-100 dark:ring-amber-900' :
                          index === 1 ? 'ring-slate-100 dark:ring-slate-700' :
                            'ring-orange-100 dark:ring-orange-900'
                        }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 dark:text-white truncate">{scorer.user.name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{scorer.user.position}</p>
                    </div>
                    <div className={`font-bold text-lg whitespace-nowrap ${index === 0 ? 'text-amber-500' :
                      index === 1 ? 'text-slate-400' :
                        'text-orange-500'
                      }`}>
                      {scorer.finalScore.toFixed(2)}
                    </div>
                  </div>
                ))}
                <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      Average Score: <span className="font-bold text-slate-900 dark:text-white">{(topScorers.reduce((acc, s) => acc + s.finalScore, 0) / topScorers.length).toFixed(2)}</span>
                    </p>
                    <a href="/dashboard/evaluation" className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors text-sm">
                      View All Evaluations
                    </a>
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
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover-lift group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${colorStyles[color] || colorStyles.blue}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
