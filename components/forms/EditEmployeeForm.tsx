'use client';

import { useState } from 'react';
import { updateEmployee } from '@/app/actions/employees';
import { Department, User, Role, Gender } from '@prisma/client';
import { Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

interface Props {
    user: User & {
        department: Department | null;
        managedDepartments?: Department[];
    };
    departments: Department[];
    managers: { id: string; name: string; position: string }[];
    viewerRole?: string;
}

export default function EditEmployeeForm({ user, departments, managers, viewerRole }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isAdmin = viewerRole === 'ADMIN';

    // State for managed departments checkboxes
    const [selectedManagedDepts, setSelectedManagedDepts] = useState<string[]>(
        user.managedDepartments?.map(d => d.id) || []
    );

    const handleManagedDeptChange = (deptId: string, checked: boolean) => {
        if (checked) {
            setSelectedManagedDepts(prev => [...prev, deptId]);
        } else {
            setSelectedManagedDepts(prev => prev.filter(id => id !== deptId));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        // Explicitly append managed departments if not handled by hidden inputs (but they are)
        // Hidden inputs are: <input type="hidden" name="managedDepartmentIds" ... />

        const res = await updateEmployee(user.id, formData);

        if (res?.error) {
            toast.error(res.error);
            setError(res.error);
            setLoading(false);
        } else {
            toast.success("Data karyawan berhasil diperbarui");
            router.back();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Info */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Personal Information</h3>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Full Name</label>
                        <input name="name" defaultValue={user.name!} className="w-full p-2 border rounded-lg dark:bg-slate-900" required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Email Address</label>
                        <input name="email" type="email" defaultValue={user.email!} className="w-full p-2 border rounded-lg dark:bg-slate-900" required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Gender</label>
                        <select name="gender" defaultValue={user.gender || 'MALE'} className="w-full p-2 border rounded-lg dark:bg-slate-900">
                            <option value={Gender.MALE}>Male</option>
                            <option value={Gender.FEMALE}>Female</option>
                        </select>
                    </div>
                </div>

                {/* Employment Info */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b pb-2">Employment Details</h3>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Employee ID (NIK)</label>
                        <input name="employeeId" defaultValue={user.employeeId!} className="w-full p-2 border rounded-lg dark:bg-slate-900" required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Department</label>
                        <select
                            name="departmentId"
                            defaultValue={user.departmentId || ''}
                            className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                            disabled={!isAdmin}
                        >
                            <option value="">-- Select Department --</option>
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Position</label>
                        <input name="position" defaultValue={user.position!} className="w-full p-2 border rounded-lg dark:bg-slate-900" required />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1">Direct Manager</label>
                        <select
                            name="managerId"
                            defaultValue={user.managerId || ''}
                            className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                            disabled={!isAdmin}
                        >
                            <option value="">-- No Manager (Top Level) --</option>
                            {managers.map(m => (
                                <option key={m.id} value={m.id}>{m.name} - {m.position}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-1">Role</label>
                            <select
                                name="role"
                                defaultValue={user.role}
                                className={`w-full p-2 border rounded-lg dark:bg-slate-900 ${!isAdmin ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800' : ''}`}
                                disabled={!isAdmin}
                            >
                                <option value={Role.EMPLOYEE}>Employee</option>
                                <option value={Role.MANAGER}>Manager</option>
                                <option value={Role.SUPERVISOR}>Supervisor</option>
                                <option value={Role.ADMIN}>Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-1">Join Date</label>
                            <input name="joinDate" type="date" defaultValue={user.joinDate ? new Date(user.joinDate).toISOString().split('T')[0] : ''} className="w-full p-2 border rounded-lg dark:bg-slate-900" />
                        </div>
                    </div>
                </div>

                {/* Managed Departments (Admin Only) */}
                {isAdmin && (
                    <div className="md:col-span-2 border-t pt-4 mt-4">
                        <h3 className="font-bold text-lg mb-2 text-slate-800 dark:text-slate-200">
                            Managed Departments
                            <span className="text-xs font-normal text-slate-500 ml-2">(For Managers & Supervisors only)</span>
                        </h3>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {departments.map(dept => (
                                <label key={dept.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded transition">
                                    <input
                                        type="checkbox"
                                        checked={selectedManagedDepts.includes(dept.id)}
                                        onChange={(e) => handleManagedDeptChange(dept.id, e.target.checked)}
                                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{dept.name}</span>
                                </label>
                            ))}
                        </div>
                        {selectedManagedDepts.map(id => (
                            <input key={id} type="hidden" name="managedDepartmentIds" value={id} />
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2 rounded-lg font-bold text-slate-500 hover:bg-slate-100 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update Employee</>}
                </button>
            </div>
        </form>
    );
}
