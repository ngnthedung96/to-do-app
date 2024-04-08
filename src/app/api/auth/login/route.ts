import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
const addUserScheme = z.object({
  password: z.string(),
  email: z.string().email(),
});

const prisma = new PrismaClient();
export async function POST(request: NextRequest, response: NextResponse) {
  const res = await request.json();
  const {
    password,
    email,
  }: {
    password: string;
    email: string;
  } = res;
  const validation = addUserScheme.safeParse(res);
  if (!validation.success) {
    return NextResponse.json(
      { status: 402, error: true, message: "Thiếu dữ liệu" },
      { status: 402 }
    );
  }
  const user = await prisma.users.findFirst({
    where: {
      email,
    },
  });
  if (!user) {
    return NextResponse.json(
      { status: 400, message: "Thất bại" },
      { status: 400 }
    );
  }
  const { password: currentPass } = user;
  const checkPassword = await bcrypt.compare(password, currentPass);
  if (checkPassword) {
    return NextResponse.json(
      {
        data: { name: user.name, email: user.email },
        status: 200,
        message: "Thành công",
      },
      { status: 200 }
    );
  } else {
    return NextResponse.json(
      { status: 400, message: "Thất bại" },
      { status: 400 }
    );
  }
}
