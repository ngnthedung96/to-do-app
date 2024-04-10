import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const addUserScheme = z.object({
  name: z.string(),
});
const getListUserScheme = z.object({
  idProject: z
    .number()
    .optional()
    .refine(async (id) => {
      if (id) {
        const project = await prisma.projects.findUnique({
          where: {
            id,
          },
        });
        return project ? true : false;
      } else {
        return true;
      }
    }),
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
  const searchParams = request.nextUrl.searchParams;
  const idProject: string | null = searchParams.get("idProject");
  const formattedIdProject = idProject ? Number(idProject) : undefined;
  const validation = await getListUserScheme.safeParseAsync({
    idProject: formattedIdProject ? formattedIdProject : undefined,
  });
  if (!validation.success) {
    return NextResponse.json(
      {
        status: 402,
        error: true,
        message: "Dữ liệu không hợp lệ",
        errors: validation.error,
      },
      { status: 402 }
    );
  }
  let objCondition: any = {};
  if (idProject) {
    objCondition = {
      ...objCondition,
      projectUsers: {
        some: {
          idProject: formattedIdProject,
        },
      },
    };
  }
  const data = await prisma.users.findMany({
    where: objCondition,
    include: {
      projectUsers: true,
    },
  });

  return NextResponse.json(
    { data: data, error: false, status: 200, message: "Thành công" },
    { status: 200 }
  );
}
