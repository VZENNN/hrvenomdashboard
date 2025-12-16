import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

// 1. GET: Ambil semua data user
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

// 2. POST: Tambah Karyawan Baru
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { 
      employeeId, 
      email, 
      password, 
      name, 
      gender, 
      position, 
      role, 
      departmentId, 
      managerId,
      joinDate 
    } = body;

    if (!employeeId || !email || !password || !name || !gender || !position) {
      return NextResponse.json({ error: "Field wajib harus diisi!" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { employeeId: employeeId }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email atau NIK (Employee ID) sudah terdaftar!" }, { status: 409 });
    }

    // Hash Password sebelum masuk DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User ke Database
    const newUser = await prisma.user.create({
      data: {
        employeeId,
        email,
        password: hashedPassword,
        name,
        gender,   
        position,
        role: role || "EMPLOYEE", 
        departmentId, 
        managerId,    
        joinDate: joinDate ? new Date(joinDate) : undefined,
      },
    });

    // return data user (tapi jangan balikin passwordnya ke response ya, bahaya wkwk)
    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}