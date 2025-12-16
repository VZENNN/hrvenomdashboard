// prisma/seed.ts
import { PrismaClient, Role, Gender, EmployeeStatus, KpiType } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding Real Data...')

  // 1. Reset Database
  await prisma.evaluationItem.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.kpiCriteria.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  // 2. Buat Password Hash (Default: 123456)
  const password = await bcrypt.hash('123456', 10)

  // 3. Buat Departemen
  const deptIT = await prisma.department.create({
    data: { name: 'IT Development', description: 'Tim Programmer & Tech' }
  })
  
  const deptFinance = await prisma.department.create({
    data: { name: 'Finance, Accounting & Tax', description: 'Keuangan & Pajak' }
  })

  const deptWarehouse = await prisma.department.create({
    data: { name: 'Warehouse & Logistic', description: 'Gudang & Pengiriman' }
  })

  // ==========================================
  // 4. MASTER KPI: BAGIAN C (BEHAVIORAL - GLOBAL)
  // Berlaku untuk SEMUA Departemen (departmentId = null)
  // ==========================================
  const criteriaBehavior = [
    { title: 'Kedisiplinan Kerja', category: 'General' },
    { title: 'Kepatuhan & Loyalitas', category: 'General' },
    { title: 'Komunikasi & Kerjasama', category: 'General' },
    { title: 'Inisiatif & Inovasi', category: 'General' },
    { title: 'Laporan Kerja', category: 'General' },
  ]

  for (const item of criteriaBehavior) {
    await prisma.kpiCriteria.create({
      data: {
        title: item.title,
        category: item.category,
        type: KpiType.BEHAVIORAL,
        departmentId: null
      }
    })
  }

  // ==========================================
  // 5. MASTER KPI: BAGIAN D (TECHNICAL - PER DEPT)
  // ==========================================

  // A. KPI FINANCE
  const kpiFinanceClosing = await prisma.kpiCriteria.create({
    data: { title: 'Monthly Closing', category: 'Accounting', type: KpiType.TECHNICAL, departmentId: deptFinance.id }
  })
  const kpiFinanceTax = await prisma.kpiCriteria.create({
    data: { title: 'Tax Submission', category: 'Tax', type: KpiType.TECHNICAL, departmentId: deptFinance.id }
  })
  const kpiFinanceCompliance = await prisma.kpiCriteria.create({
    data: { title: 'Compliance (Workflow & Budget)', category: 'Audit', type: KpiType.TECHNICAL, departmentId: deptFinance.id }
  })
  const kpiFinanceInvoicing = await prisma.kpiCriteria.create({
    data: { title: 'Invoicing Accuracy', category: 'AR/AP', type: KpiType.TECHNICAL, departmentId: deptFinance.id }
  })

  // B. KPI WAREHOUSE
  const kpiWhStock = await prisma.kpiCriteria.create({
    data: { title: 'Stock Balance Accuracy', category: 'Inventory', type: KpiType.TECHNICAL, departmentId: deptWarehouse.id }
  })
  const kpiWhTeam = await prisma.kpiCriteria.create({
    data: { title: 'Team Utilization', category: 'Manpower', type: KpiType.TECHNICAL, departmentId: deptWarehouse.id }
  })
  
  // ==========================================
  // 6. BUAT USER (DATA KARYAWAN SESUAI PDF)
  // ==========================================

  // --- GM Finance ---
  // Penilai untuk Laura & Lim Diana
  const julia = await prisma.user.create({
    data: {
      email: 'julia.jaumil@venom.com',
      employeeId: 'GM-FIN-001',
      name: 'Julia Jaumil',
      position: 'GM Finance, Accounting & Admin',
      departmentId: deptFinance.id,
      role: Role.MANAGER,
      gender: Gender.FEMALE,
      status: EmployeeStatus.ACTIVE,
      password,
      joinDate: new Date('2015-01-01')
    }
  })

  // --- CASE 1: LAURA LEA (Accounting SPV) ---
  // Dinilai oleh: Julia Jaumil
  const laura = await prisma.user.create({
    data: {
      email: 'laura.lea@venom.com',
      employeeId: 'SSA025',
      name: 'Laura Lea Fangi',
      position: 'Accounting SPV',
      departmentId: deptFinance.id,
      role: Role.MANAGER, // Dia Manager karena menilai Yutis & Safa nanti
      gender: Gender.FEMALE,
      status: EmployeeStatus.ACTIVE,
      password,
      managerId: julia.id, // Atasannya Julia
      joinDate: new Date('2019-05-08')
    }
  })

  // --- CASE 2: LIM DIANA (Finance SPV) ---
  // Dinilai oleh: Julia Jaumil
  const limDiana = await prisma.user.create({
    data: {
      email: 'lim.diana@venom.com',
      employeeId: 'SSA017',
      name: 'Lim Diana',
      position: 'Finance SPV',
      departmentId: deptFinance.id,
      role: Role.MANAGER, // Dia menilai Nur Annisa & Sri Wahyuni
      gender: Gender.FEMALE,
      status: EmployeeStatus.ACTIVE,
      password,
      managerId: julia.id,
      joinDate: new Date('2023-05-15')
    }
  })

  // --- CASE 3: NUR ANNISA (Admin Finance) ---
  // Dinilai oleh: Lim Diana
  const nurAnnisa = await prisma.user.create({
    data: {
      email: 'nur.annisa@venom.com',
      employeeId: 'SSA040',
      name: 'Nur Annisa',
      position: 'Admin Finance',
      departmentId: deptFinance.id,
      role: Role.EMPLOYEE,
      gender: Gender.FEMALE,
      status: EmployeeStatus.ACTIVE,
      password,
      managerId: limDiana.id, // Atasannya Lim Diana
      joinDate: new Date('2021-06-02')
    }
  })

  // --- CASE 4: SAFA (Kepala Gudang/Warehouse) ---
  // Dinilai oleh: Laura Lea (Sesuai PDF Page 17)
  const safa = await prisma.user.create({
    data: {
      email: 'safa@venom.com',
      employeeId: 'SSA165',
      name: 'Safa',
      position: 'Kepala Gudang',
      departmentId: deptWarehouse.id,
      role: Role.EMPLOYEE,
      gender: Gender.FEMALE,
      status: EmployeeStatus.ACTIVE,
      password,
      managerId: laura.id,
      joinDate: new Date('2023-09-11')
    }
  })


  // ==========================================
  // 7. SIMULASI PENILAIAN (EVALUATIONS)
  // ==========================================
  
  // Ambil KPI Behavioral Global
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
      feedback: 'Kinerja cukup baik, tingkatkan inisiatif.',
      items: {
        create: [
            { criteriaId: globalKpis[0].id, score: 4, weight: 0 },
            { criteriaId: globalKpis[1].id, score: 4, weight: 0 },
            { 
                criteriaId: kpiFinanceInvoicing.id,
                target: '100%', actual: '80', weight: 50, score: 3
            },
            { 
                criteriaId: kpiFinanceCompliance.id,
                target: '100%', actual: '96', weight: 25, score: 4
            }
        ]
      }
    }
  })
  
  await prisma.evaluation.create({
    data: {
      userId: safa.id,
      appraiserId: laura.id,
      month: 10,
      year: 2025,
      behaviorScore: 2.92,
      technicalScore: 2.50,
      finalScore: 2.66,
      feedback: 'Perlu peningkatan di manajemen stok.',
      items: {
        create: [
            { 
                criteriaId: kpiWhStock.id, // Stock Balance
                target: '100%', actual: '70', weight: 25, score: 2 
            },
            { 
                criteriaId: kpiWhTeam.id, // Team Utilization
                target: '100%', actual: '85', weight: 50, score: 3
            }
        ]
      }
    }
  })

  console.log('Seeding Real Data Finance & Warehouse Selesai!')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })