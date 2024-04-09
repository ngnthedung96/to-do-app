import { NoteStatus, PrismaClient } from "@prisma/client";
import moment from "moment";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "../auth/[...nextauth]/options";
// ----------------------------------------validation----------------------------
// add
const addProjectScheme = z.object({
  name: z.string(),
  arrIdAssignee: z.array(z.number()).nonempty(),
});
// get
const getListProjectScheme = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
  project: z.string().optional(),
});
// --------------------------METHOD--------------------------
const prisma = new PrismaClient();
export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const res = await request.json();
    const {
      name,
      arrIdAssignee,
    }: {
      name: string;
      arrIdAssignee: number[];
    } = res;
    const sessionUser = await getUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: false, status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { user } = sessionUser;
    const validation = await addProjectScheme.safeParseAsync({
      name,
      arrIdAssignee: arrIdAssignee ? arrIdAssignee : undefined,
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
    const currentTime = moment().unix();
    const data: any = {
      name,
      createdBy: Number(user?.id),
      updatedBy: null,
      projectUsers: {},
      createdTime: currentTime,
    };
    if (arrIdAssignee) {
      const newData = [];
      for (let idAssignee of arrIdAssignee) {
        newData.push({ idUser: idAssignee });
      }
      data.projectUsers.create = newData;
    }
    const newProject = await prisma.projects.create({
      data,
      include: {
        projectUsers: true,
      },
    });
    return NextResponse.json(
      { error: false, status: 200, message: "Thành công" },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 400, error: true, message: "Có lỗi", errors: err },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest, response: NextResponse) {
  try {
    const sessionUser = await getUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: false, status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { user } = sessionUser;
    const searchParams = request.nextUrl.searchParams;
    const limit: string | null = searchParams.get("limit");
    const page: string | null = searchParams.get("page");
    const project: string | null = searchParams.get("project");
    // format
    const formattedLimit = limit ? Number(limit) : undefined;
    const formattedPage = page ? Number(page) : undefined;
    const validation = getListProjectScheme.safeParse({
      limit: formattedLimit ? formattedLimit : undefined,
      page: formattedPage ? formattedPage : undefined,
      project: project ? project : undefined,
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
    let objCondition: any = {
      projectUsers: {
        some: {
          idUser: user.id,
        },
      },
    };
    // condition
    if (project) {
      objCondition.name = {
        contains: project,
      };
    }
    const query: any = {
      where: objCondition,
      include: {
        projectUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        userCreate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        userUpdate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        {
          id: "desc",
        },
      ],
    };
    // pagination
    if (formattedLimit && formattedPage) {
      const skip = (formattedPage - 1) * formattedLimit;
      query.skip = skip;
      query.take = formattedLimit;
    }
    const data = await prisma.$transaction([
      prisma.projects.count({
        where: objCondition,
      }),
      prisma.projects.findMany(query),
    ]);
    const totalProject = data[0];
    const listProject = data[1];
    return NextResponse.json(
      {
        data: {
          totalProject,
          listProject,
          page: formattedPage,
          limit: formattedLimit,
        },
        error: false,
        status: 200,
        message: "Thành công",
      },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { status: 400, error: true, message: "Có lỗi" },
      { status: 400 }
    );
  }
}
