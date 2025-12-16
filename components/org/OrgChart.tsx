'use client';

import { User } from "@prisma/client";
import { useMemo } from "react";
import { Download, Printer } from "lucide-react";

interface Props {
    users: User[];
}

interface TreeNode extends User {
    children: TreeNode[];
}

export default function OrgChart({ users }: Props) {

    const tree = useMemo(() => {
        const userMap = new Map<string, TreeNode>();
        users.forEach(u => userMap.set(u.id, { ...u, children: [] }));

        const roots: TreeNode[] = [];

        users.forEach(u => {
            const node = userMap.get(u.id);
            if (u.managerId && userMap.has(u.managerId)) {
                userMap.get(u.managerId)?.children.push(node!);
            } else {
                roots.push(node!);
            }
        });

        return roots;
    }, [users]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center no-print">
                <div>
                    <h2 className="text-xl font-bold dark:text-white">Organization Structure</h2>
                    <p className="text-sm text-slate-500">Visual hierarchy of VENOM team.</p>
                </div>
                <button
                    onClick={handlePrint}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition"
                >
                    <Printer size={18} /> Export PDF
                </button>
            </div>

            <div className="overflow-auto bg-slate-50 dark:bg-slate-900/50 p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 min-h-[500px]">
                <div className="org-tree-container flex justify-center min-w-max">
                    {tree.map(node => (
                        <OrgNode key={node.id} node={node} />
                    ))}
                </div>
            </div>

            <style jsx global>{`
        @media print {
          .no-print, nav, aside { display: none !important; }
          main { margin: 0 !important; padding: 0 !important; }
          .org-tree-container { zoom: 80%; }
        }
      `}</style>
        </div>
    );
}

function OrgNode({ node }: { node: TreeNode }) {
    return (
        <div className="flex flex-col items-center">
            <div className="flex flex-col items-center relative z-10 mb-8">
                <div className="w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-md bg-white flex items-center justify-center overflow-hidden mb-2">
                    {node.avatarUrl ?
                        <img src={node.avatarUrl} className="w-full h-full object-cover" /> :
                        <span className="text-xl font-bold text-slate-400">{node.name.charAt(0)}</span>
                    }
                </div>
                <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 text-center min-w-[180px]">
                    <div className="font-bold text-slate-900 dark:text-white text-sm">{node.name}</div>
                    <div className="text-purple-600 dark:text-purple-400 text-xs font-semibold">{node.position}</div>
                </div>
            </div>

            {node.children.length > 0 && (
                <div className="relative flex justify-center gap-8 pt-4 border-t-2 border-slate-300 dark:border-slate-700">
                    {/* Creating the connecting lines using pseudo-elements would be better but simple border-t works for tree visualization */}
                    {node.children.map(child => (
                        <div key={child.id} className="relative pt-4 before:absolute before:top-[-18px] before:left-1/2 before:-translate-x-1/2 before:w-px before:h-[18px] before:bg-slate-300 dark:before:bg-slate-700">
                            <OrgNode node={child} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
