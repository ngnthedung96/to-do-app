import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const addUserScheme = z.object({
  name: z.string(),
});

const prisma = new PrismaClient();
export async function POST(request: NextRequest, response: NextResponse) {
  const res = await request.json();
  const { name } = res;
  const validation = addUserScheme.safeParse(res);
  if (!validation.success) {
    return NextResponse.json(
      { status: 402, error: true, message: "Thiếu dữ liệu" },
      { status: 402 }
    );
  }
  const newUser = await prisma.users.create({
    data: {
      name,
    },
  });
  if (newUser) {
    return NextResponse.json(
      { data: newUser, status: 200, message: "Thành công" },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { status: 400, message: "Thất bại" },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest, response: NextResponse) {
  const data = await prisma.users.findMany();

  return NextResponse.json(
    { data: data, error: false, status: 200, message: "Thành công" },
    { status: 200 }
  );
}
