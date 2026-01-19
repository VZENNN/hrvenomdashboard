'use client';

import { useRouter } from "next/navigation";
import { createEmployee } from "@/app/actions/employees";
import { Department, User } from "@prisma/client";
import { Save } from "lucide-react";
import { toast } from "sonner";

interface Props {
    departments: Department[];
    managers: User[];
}

export default function AddEmployeeForm({ departments, managers }: Props) {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        const result = await createEmployee(formData);
        if (result?.error) {
            toast.error(result.error);
        } else {
            toast.success("Karyawan berhasil ditambahkan");
            router.push("/dashboard/employees");
        }
    }

    return (
        <form action={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Identity */}
            <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-semibold border-b pb-2">Identity</h3>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <input name="name" required className="w-full p-2 border rounded" placeholder="John Doe" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Employee ID (NIK)</label>
                <input name="employeeId" required className="w-full p-2 border rounded" placeholder="V-001" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input name="email" type="email" required className="w-full p-2 border rounded" placeholder="john@venom.com" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <input name="password" type="password" required className="w-full p-2 border rounded" placeholder="******" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Gender</label>
                <select name="gender" className="w-full p-2 border rounded">
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Join Date</label>
                <input name="joinDate" type="date" className="w-full p-2 border rounded" />
            </div>

            {/* Organization */}
            <div className="space-y-4 md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold border-b pb-2">Organization</h3>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Department</label>
                <select name="departmentId" className="w-full p-2 border rounded">
                    <option value="">- Select Department -</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Position (Jabatan)</label>
                <input name="position" required className="w-full p-2 border rounded" placeholder="e.g. Staff, Manager" />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Role (System)</label>
                <select name="role" className="w-full p-2 border rounded">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                    <option value="APPLICANT">Applicant</option>
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Direct Manager</label>
                <select name="managerId" className="w-full p-2 border rounded">
                    <option value="">- No Manager -</option>
                    {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.name} - {m.position}</option>
                    ))}
                </select>
            </div>

            <div className="md:col-span-2 mt-6">
                <button type="submit" className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-bold w-full justify-center md:w-auto">
                    <Save size={18} /> Save Employee
                </button>
            </div>
        </form >
    );
}
