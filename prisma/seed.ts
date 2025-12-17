// prisma/seed.ts
import { PrismaClient, Role, Gender, EmployeeStatus, KpiType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Start seeding VENOM HR System...')

    // ==========================================
    // 1. RESET DATABASE (BERSIH-BERSIH)
    // ==========================================
    await prisma.evaluationItem.deleteMany()
    await prisma.evaluation.deleteMany()
    await prisma.kpiCriteria.deleteMany()
    await prisma.user.deleteMany()
    await prisma.department.deleteMany()

    console.log('🗑️  Database cleared.')

    // ==========================================
    // 2. PERSIAPAN PASSWORD
    // ==========================================
    // Password default: "venom123" (Biar aman & seragam saat dev)
    const password = await bcrypt.hash('venom123', 10)

    // ==========================================
    // 3. BUAT DEPARTEMEN (ORGANIZATION STRUCTURE)
    // ==========================================
    const deptIT = await prisma.department.create({
        data: { name: 'IT & Digital Transformation', description: 'System Development & Maintenance' }
    })

    const deptHR = await prisma.department.create({
        data: { name: 'Human Capital', description: 'HRD & GA' }
    })

    const deptFinance = await prisma.department.create({
        data: { name: 'Finance, Accounting & Tax', description: 'Keuangan & Pajak' }
    })

    const deptWarehouse = await prisma.department.create({
        data: { name: 'Warehouse & Logistic', description: 'Gudang & Pengiriman' }
    })

    console.log('🏢 Departments created.')

    // ==========================================
    // 4. THE CHOSEN ONE: SUPER ADMIN (AKUN UTAMA)
    // ==========================================
    // Ini adalah satu-satunya akun yang bisa akses menu "Register Employee"
    const superAdmin = await prisma.user.create({
        data: {
            email: 'admin@venom.com',
            employeeId: 'V-ADM-001',
            name: 'Venom Administrator',
            position: 'Head of IT Security',
            departmentId: deptIT.id,
            role: Role.ADMIN,
            gender: Gender.MALE,
            status: EmployeeStatus.ACTIVE,
            password, // Password: venom123
            joinDate: new Date('2020-01-01')
        }
    })

    console.log('👑 Super Admin Created: admin@venom.com / venom123')

    // ==========================================
    // 5. MASTER KPI: BAGIAN C (BEHAVIORAL - GLOBAL)
    // ==========================================
    const criteriaBehavior = [
        { title: 'Kedisiplinan Kerja (Discipline)', category: 'Core Values' },
        { title: 'Integritas & Kejujuran (Integrity)', category: 'Core Values' },
        { title: 'Komunikasi & Kerjasama (Teamwork)', category: 'Core Values' },
        { title: 'Inisiatif & Inovasi (Innovation)', category: 'Competency' },
        { title: 'Orientasi Hasil (Result Oriented)', category: 'Competency' },
    ]

    for (const item of criteriaBehavior) {
        await prisma.kpiCriteria.create({
            data: {
                title: item.title,
                category: item.category,
                type: KpiType.BEHAVIORAL,
                departmentId: null // Global
            }
        })
    }

    // ==========================================
    // 6. MASTER KPI: BAGIAN D (TECHNICAL - PER DEPT)
    // ==========================================

    // A. KPI FINANCE (CONTUM - Position Specific)
    // SPV Level
    const kpiFinanceClosing = await prisma.kpiCriteria.create({
        data: {
            title: 'Monthly Closing Accuracy',
            category: 'Accounting',
            type: KpiType.TECHNICAL,
            departmentId: deptFinance.id,
            position: 'Finance SPV' // <--- KHUSUS SPV
        }
    })

    const kpiFinanceTax = await prisma.kpiCriteria.create({
        data: {
            title: 'Tax Submission Compliance',
            category: 'Tax',
            type: KpiType.TECHNICAL,
            departmentId: deptFinance.id,
            position: 'Finance SPV' // <--- KHUSUS SPV
        }
    })

    // Admin Level
    const kpiFinanceInvoicing = await prisma.kpiCriteria.create({
        data: {
            title: 'Invoicing SLA (< 2 Days)',
            category: 'AR/AP',
            type: KpiType.TECHNICAL,
            departmentId: deptFinance.id,
            position: 'Admin Finance' // <--- KHUSUS STAFF
        }
    })

    // B. KPI WAREHOUSE
    const kpiWhStock = await prisma.kpiCriteria.create({
        data: { title: 'Stock Opname Accuracy (99%)', category: 'Inventory', type: KpiType.TECHNICAL, departmentId: deptWarehouse.id }
    })
    const kpiWhDispatch = await prisma.kpiCriteria.create({
        data: { title: 'On-Time Dispatch Rate', category: 'Logistic', type: KpiType.TECHNICAL, departmentId: deptWarehouse.id }
    })

    console.log('KPI Master Data created.')

    // ==========================================
    // 7. BUAT USER HIRARKI (DEMO DATA)
    // ==========================================

    // --- GM Finance (Manager Level 1) ---
    const julia = await prisma.user.create({
        data: {
            email: 'julia.jaumil@venom.com',
            employeeId: 'GM-FIN-001',
            name: 'Julia Jaumil',
            position: 'GM Finance',
            departmentId: deptFinance.id,
            role: Role.MANAGER,
            gender: Gender.FEMALE,
            status: EmployeeStatus.ACTIVE,
            password,
            joinDate: new Date('2015-01-01')
        }
    })

    // --- Finance SPV (Level 2 - Bawahan Julia) ---
    const limDiana = await prisma.user.create({
        data: {
            email: 'lim.diana@venom.com',
            employeeId: 'SPV-FIN-001',
            name: 'Lim Diana',
            position: 'Finance SPV',
            departmentId: deptFinance.id,
            role: Role.MANAGER,
            gender: Gender.FEMALE,
            status: EmployeeStatus.ACTIVE,
            password,
            managerId: julia.id, // Report to Julia
            joinDate: new Date('2023-05-15')
        }
    })

    // --- Staff Admin (Level 3 - Bawahan Lim Diana) ---
    const nurAnnisa = await prisma.user.create({
        data: {
            email: 'nur.annisa@venom.com',
            employeeId: 'STF-FIN-001',
            name: 'Nur Annisa',
            position: 'Admin Finance',
            departmentId: deptFinance.id,
            role: Role.EMPLOYEE,
            gender: Gender.FEMALE,
            status: EmployeeStatus.ACTIVE,
            password,
            managerId: limDiana.id,
            joinDate: new Date('2021-06-02')
        }
    })

    // --- Kepala Gudang (Level 2 - Bawahan Julia/Cross Dept) ---
    // Anggaplah Gudang report ke GM Finance secara operasional di kasus ini
    const safa = await prisma.user.create({
        data: {
            email: 'safa@venom.com',
            employeeId: 'SPV-WH-001',
            name: 'Safa',
            position: 'Kepala Gudang',
            departmentId: deptWarehouse.id,
            role: Role.EMPLOYEE,
            gender: Gender.FEMALE,
            status: EmployeeStatus.ACTIVE,
            password,
            managerId: julia.id,
            joinDate: new Date('2023-09-11')
        }
    })

    console.log('Employee Hierarchy created.')

    // ==========================================
    // 8. SIMULASI PENILAIAN (EVALUATIONS)
    // ==========================================

    // Contoh: Lim Diana menilai Nur Annisa
    const globalKpis = await prisma.kpiCriteria.findMany({ where: { type: KpiType.BEHAVIORAL } })

    await prisma.evaluation.create({
        data: {
            userId: nurAnnisa.id,
            appraiserId: limDiana.id,
            month: 10,
            year: 2025,
            behaviorScore: 3.68,
            technicalScore: 3.25,
            finalScore: 3.42,
            feedback: 'Kinerja cukup baik, tingkatkan ketelitian invoicing.',
            items: {
                create: [
                    // Penilaian Behavioral (Ambil 2 sampel)
                    { criteriaId: globalKpis[0].id, score: 4, weight: 0 },
                    { criteriaId: globalKpis[1].id, score: 4, weight: 0 },
                    // Penilaian Technical
                    {
                        criteriaId: kpiFinanceInvoicing.id,
                        target: '100%', actual: '80%', weight: 50, score: 3
                    },
                    {
                        criteriaId: kpiFinanceClosing.id,
                        target: '100%', actual: '100%', weight: 50, score: 4
                    }
                ]
            }
        }
    })

    console.log('Evaluation Dummy Data created.')
    console.log('SEEDING COMPLETE! Login with: admin@venom.com / venom123')
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })