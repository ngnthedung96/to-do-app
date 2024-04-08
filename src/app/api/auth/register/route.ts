import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
const prisma = new PrismaClient();
const addUserScheme = z.object({
  name: z.string(),
  password: z.string(),
  email: z
    .string()
    .email()
    .refine(async (val) => {
      if (val) {
        const existEmail = await prisma.users.findFirst({
          where: {
            email: val,
          },
        });
        if (existEmail) {
          return false;
        } else {
          return true;
        }
      }
      return false;
    }),
});

export async function POST(request: NextRequest, response: NextResponse) {
  const res = await request.json();
  const {
    name,
    password,
    email,
  }: {
    name: string;
    password: string;
    email: string;
  } = res;
  const validation = await addUserScheme.safeParseAsync(res);
  if (!validation.success) {
    return NextResponse.json(
      { status: 402, error: true, message: "Thiếu dữ liệu hoặc trùng email" },
      { status: 402 }
    );
  }
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  const newUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hash,
      salt: salt,
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
