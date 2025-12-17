export default function Loading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded mt-2"></div>
                </div>
                <div className="h-10 w-32 bg-purple-200 dark:bg-purple-900/30 rounded-lg"></div>
            </div>

            {/* Filter */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="h-10 w-64 bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
            </div>

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                            <th className="p-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                            <th className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                            <th className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                            <th className="p-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                            <th className="p-4"><div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                            <th className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div></th>
                            <th className="p-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto"></div></th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="border-b border-slate-50 dark:border-slate-800">
                                <td className="p-4"><div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                <td className="p-4"><div className="h-4 w-40 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                <td className="p-4"><div className="h-6 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full"></div></td>
                                <td className="p-4"><div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                <td className="p-4"><div className="h-4 w-20 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                <td className="p-4"><div className="h-4 w-10 bg-slate-100 dark:bg-slate-800 rounded"></div></td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                        <div className="h-8 w-8 bg-slate-100 dark:bg-slate-800 rounded"></div>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Skeleton */}
            <div className="flex justify-center gap-2">
                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-10 w-24 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
                <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            </div>
        </div>
    );
}
