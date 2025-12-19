import React, { memo } from 'react';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { User } from '@prisma/client';
import { BadgeCheck, Trash2, User as UserIcon } from 'lucide-react';

export type OrgNodeData = {
    label?: string; // For flexibility
    name: string;
    position: string;
    avatarUrl?: string;
    isRoot?: boolean;
    onEdit?: (id: string, field: string, value: string) => void;
    onDelete?: (id: string) => void;
};

const OrgNode = ({ data, id, selected }: NodeProps<any>) => {
    const { name, position, avatarUrl, onEdit, onDelete, isRoot } = data as OrgNodeData;

    return (
        <div className={`
      relative group min-w-[240px] rounded-2xl transition-all duration-300
      ${selected
                ? 'ring-4 ring-purple-500/30 shadow-2xl scale-105 bg-white dark:bg-slate-800'
                : 'bg-white/90 dark:bg-slate-900/90 hover:shadow-xl border border-slate-200 dark:border-slate-700'
            }
      backdrop-blur-xl
    `}>
            {/* Gradient Header Line */}
            <div className={`h-1.5 w-full rounded-t-2xl bg-gradient-to-r ${isRoot ? 'from-amber-400 via-orange-500 to-red-500' : 'from-indigo-500 via-purple-500 to-pink-500'}`} />

            {/* Delete Button (visible on hover) */}
            {!isRoot && (
                <button
                    onClick={(e) => {
                        e.stopPropagation(); // prevent selecting the node
                        onDelete?.(id);
                    }}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-500 transition-all"
                >
                    <Trash2 size={14} />
                </button>
            )}

            <div className="p-5 flex flex-col items-center gap-3">
                {/* Avatar Section */}
                <div className="relative">
                    <div className={`
                    w-16 h-16 rounded-full border-4 shadow-md flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800
                    ${isRoot ? 'border-amber-100 dark:border-amber-900/30' : 'border-purple-50 dark:border-purple-900/30'}
                `}>
                        {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className="object-cover w-full h-full" />
                        ) : (
                            <UserIcon className="text-slate-400 dark:text-slate-500" size={32} />
                        )}
                    </div>
                    {/* Status Indicator Badge */}
                    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${isRoot ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                        <BadgeCheck size={10} className="text-white" />
                    </div>
                </div>

                {/* Editable Fields */}
                <div className="w-full space-y-1 text-center">
                    <input
                        className="w-full text-center font-bold text-slate-800 dark:text-slate-100 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/50 rounded-md px-1 py-0.5 outline-none transition-all placeholder:font-normal"
                        value={name}
                        placeholder="Employee Name"
                        onChange={(e) => onEdit?.(id, 'name', e.target.value)}
                    />

                    <input
                        className="w-full text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-purple-500 focus:ring-0 rounded-md px-1 py-0.5 outline-none transition-all"
                        value={position}
                        placeholder="Position Title"
                        onChange={(e) => onEdit?.(id, 'position', e.target.value)}
                    />
                </div>
            </div>

            <Handle
                type="target"
                position={Position.Top}
                className="!w-4 !h-4 !bg-slate-300 dark:!bg-slate-600 !border-4 !border-white dark:!border-slate-900 !top-[-8px] transition hover:scale-125 hover:!bg-purple-500 hover:!border-purple-200"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-4 !h-4 !bg-slate-300 dark:!bg-slate-600 !border-4 !border-white dark:!border-slate-900 !bottom-[-8px] transition hover:scale-125 hover:!bg-purple-500 hover:!border-purple-200"
            />
        </div>
    );
};

export default memo(OrgNode);
