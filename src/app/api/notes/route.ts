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
  arrIdAssignee: z.array(z.number()).nonempty(),
});
// get
const getListNoteScheme = z.object({
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
  arrIdAssignee: z.array(z.number()).optional(),
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
      arrIdAssignee,
      status,
    }: {
      note: string;
      dueDate: number;
      arrIdAssignee: number[];
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
    const data: any = {
      note,
      status,
      dueDate: dueDate ? dueDate : 0,
      createdBy: Number(user?.id),
      updatedBy: null,
      noteUsers: {},
    };
    if (arrIdAssignee) {
      const newData = [];
      for (let idAssignee of arrIdAssignee) {
        newData.push({ idUser: idAssignee });
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
    const searchParams = request.nextUrl.searchParams;
    const limit: string | null = searchParams.get("limit");
    const page: string | null = searchParams.get("page");
    const dueDate: string | null = searchParams.get("dueDate");
    const status: string | null = searchParams.get("status");
    const arrIdAssignee = searchParams.get("arrIdAssignee");
    const arrUserCreate = searchParams.get("arrUserCreate");
    const note: string | null = searchParams.get("note");
    // format
    const formattedLimit = limit ? Number(limit) : undefined;
    const formattedPage = page ? Number(page) : undefined;
    const formattedArrIdAssignee = arrIdAssignee
      ? JSON.parse(arrIdAssignee)
      : undefined;
    const formattedArrUserCreate = arrUserCreate
      ? JSON.parse(arrUserCreate)
      : undefined;

    const validation = getListNoteScheme.safeParse({
      limit: formattedLimit ? formattedLimit : undefined,
      page: formattedPage ? formattedPage : undefined,
      dueDate: dueDate ? dueDate : undefined,
      status: status ? status : undefined,
      arrIdAssignee: formattedArrIdAssignee
        ? formattedArrIdAssignee
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
    let objCondition: any = {};
    // condition
    if (dueDate || status || arrIdAssignee || note || arrUserCreate) {
      // search note
      if (note) {
        objCondition.note = {
          contains: note,
        };
      }
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
      // search user
      if (arrIdAssignee) {
        objCondition.noteUsers = {
          some: {
            idUser: {
              in: formattedArrIdAssignee,
            },
          },
        };
      }
      if (arrUserCreate) {
        objCondition.createdBy = {
          in: formattedArrUserCreate,
        };
      }
    }
    const query: any = {
      where: objCondition,
      include: {
        noteUsers: {
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
