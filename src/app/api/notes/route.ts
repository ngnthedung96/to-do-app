import { NoteStatus, PrismaClient } from "@prisma/client";
import moment from "moment";
import { getServerSession } from "next-auth";
import { getSession } from "next-auth/react";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "../auth/[...nextauth]/options";
// ----------------------------------------validation----------------------------
// add
const addNoteScheme = z.object({
  dueDate: z.number().optional(),
  note: z.string(),
  status: z.string(),
  arrIdProjectUser: z.array(z.number()).nonempty(),
});
// get
const getListNoteScheme = z.object({
  idProject: z.number().refine(async (id) => {
    const project = await prisma.projects.findUnique({
      where: {
        id,
      },
    });
    return project ? true : false;
  }),
  limit: z.number().optional(),
  page: z.number().optional(),
  dueDate: z
    .string()
    .optional()
    .refine((dateString) => {
      if (dateString) {
        const dateArr = dateString.split("-");
        const start = moment(dateArr[0], "DD/MM/YYYY", true).isValid();
        const end = moment(dateArr[1], "DD/MM/YYYY", true).isValid();
        if (!start || !end) {
          return false;
        }
      }
      return true;
    }),
  status: z.string().optional(),
  arrIdProjectUser: z.array(z.number()).optional(),
  arrUserCreate: z.array(z.number()).optional(),
  note: z.string().optional(),
});
// --------------------------METHOD--------------------------
const prisma = new PrismaClient();
export async function POST(request: NextRequest, response: NextResponse) {
  try {
    const res = await request.json();
    const {
      note,
      dueDate,
      arrIdProjectUser,
      status,
    }: {
      note: string;
      dueDate: number;
      arrIdProjectUser: number[];
      status: NoteStatus;
    } = res;
    const sessionUser = await getUser();
    if (!sessionUser) {
      return NextResponse.json(
        { error: false, status: 401, message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { user } = sessionUser;
    const formattedDueDate = Number(dueDate);
    const validation = await addNoteScheme.safeParseAsync({
      dueDate: formattedDueDate ? formattedDueDate : undefined,
      note,
      status: status ? status : undefined,
      arrIdProjectUser: arrIdProjectUser ? arrIdProjectUser : undefined,
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
      note,
      status,
      dueDate: dueDate ? dueDate : 0,
      createdBy: Number(user?.id),
      updatedBy: null,
      noteUsers: {},
      createdTime: currentTime,
    };
    if (arrIdProjectUser) {
      const newData = [];
      for (let idProjectUser of arrIdProjectUser) {
        newData.push({ idProjectUser });
      }
      data.noteUsers.create = newData;
    }
    const newNote = await prisma.notes.create({
      data,
      include: {
        noteUsers: true,
      },
    });
    return NextResponse.json(
      { error: false, status: 200, message: "Thành công" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
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
    const dueDate: string | null = searchParams.get("dueDate");
    const status: string | null = searchParams.get("status");
    const idProject: string | null = searchParams.get("idProject");
    const arrIdProjectUser = searchParams.get("arrIdProjectUser");
    const arrUserCreate = searchParams.get("arrUserCreate");
    const note: string | null = searchParams.get("note");
    // format
    const formattedLimit = limit ? Number(limit) : undefined;
    const formattedPage = page ? Number(page) : undefined;
    const formattedIdProject = idProject ? Number(idProject) : undefined;
    const formattedArrIdProjectUser = arrIdProjectUser
      ? JSON.parse(arrIdProjectUser)
      : undefined;
    const formattedArrUserCreate = arrUserCreate
      ? JSON.parse(arrUserCreate)
      : undefined;

    const validation = await getListNoteScheme.safeParseAsync({
      limit: formattedLimit ? formattedLimit : undefined,
      page: formattedPage ? formattedPage : undefined,
      dueDate: dueDate ? dueDate : undefined,
      status: status ? status : undefined,
      idProject: formattedIdProject ? formattedIdProject : undefined,
      arrIdProjectUser: formattedArrIdProjectUser
        ? formattedArrIdProjectUser
        : undefined,
      arrUserCreate: formattedArrUserCreate
        ? formattedArrUserCreate
        : undefined,
      note: note ? note : undefined,
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

    // ------------------------condition------------------------
    let conditionNoteUsers: any = {
      projectUsers: {
        // idUser: user.id,
        idProject: formattedIdProject,
      },
    };

    // search user
    if (arrIdProjectUser) {
      conditionNoteUsers = {
        ...conditionNoteUsers,
        idProjectUser: {
          in: formattedArrIdProjectUser,
        },
      };
    }
    let objCondition: any = {
      noteUsers: {
        some: conditionNoteUsers,
      },
    };
    // date and status
    if (status == "DUEDATE" && dueDate) {
      const dateArr = dueDate.split("-");
      const startDate = dateArr[0];
      const formattedStartDate = moment(startDate, "DD/MM/YYYY")
        .startOf("days")
        .unix();
      const endDate = dateArr[1];
      const formattedEndDate = moment(endDate, "DD/MM/YYYY")
        .endOf("days")
        .unix();
      objCondition = {
        ...objCondition,
        AND: [
          {
            NOT: {
              dueDate: 0,
            },
          },
          {
            NOT: {
              status: "DONE",
            },
          },
          { dueDate: { lte: Number(currentTime) } },
          { dueDate: { gte: Number(formattedStartDate) } },
        ],
      };
    } else {
      if (status) {
        if (status == "DUEDATE") {
          objCondition = {
            ...objCondition,
            AND: [
              {
                NOT: {
                  dueDate: 0,
                },
              },
              {
                NOT: {
                  status: "DONE",
                },
              },
              {
                dueDate: {
                  lt: currentTime,
                },
              },
            ],
          };
        } else if (status != "DUEDATE") {
          objCondition.status = status;
        }
      }
      if (dueDate) {
        const dateArr = dueDate.split("-");
        const startDate = dateArr[0];
        const formattedStartDate = moment(startDate, "DD/MM/YYYY")
          .startOf("days")
          .unix();
        const endDate = dateArr[1];
        const formattedEndDate = moment(endDate, "DD/MM/YYYY")
          .endOf("days")
          .unix();
        if (startDate && endDate) {
          objCondition = {
            ...objCondition,
            AND: [
              { dueDate: { lte: Number(formattedEndDate) } },
              { dueDate: { gte: Number(formattedStartDate) } },
            ],
          };
        }
      }
    }
    // search note
    if (note) {
      objCondition.note = {
        contains: note,
      };
    }
    if (arrUserCreate) {
      objCondition.createdBy = {
        in: formattedArrUserCreate,
      };
    }

    const query: any = {
      where: objCondition,
      include: {
        noteUsers: {
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
      prisma.notes.count({
        where: objCondition,
      }),
      prisma.notes.findMany(query),
    ]);
    const totalNote = data[0];
    const listNote = data[1];
    return NextResponse.json(
      {
        data: {
          totalNote,
          listNote,
          page: formattedPage,
          limit: formattedLimit,
          objCondition,
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
