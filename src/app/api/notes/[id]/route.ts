import { PrismaClient, NoteStatus } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "../../auth/[...nextauth]/options";
import moment from "moment";
// ----------------------------------validation---------------------------
// edit
const editNoteScheme = z.object({
  id: z.number().refine(async (id) => {
    const note = await prisma.notes.findUnique({
      where: {
        id,
      },
    });
    return note ? true : false;
  }),
  dueDate: z.number().optional(),
  arrIdAssignee: z.array(z.number()).nonempty(),
  note: z.string(),
  status: z.string(),
});
// delete
const deleteNoteScheme = z.object({
  id: z.number().refine(async (id) => {
    const note = await prisma.notes.findUnique({
      where: {
        id,
      },
    });
    return note ? true : false;
  }),
});
const prisma = new PrismaClient();
// ------------------------------------method-------------------------------
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const res = await request.json();
    const {
      note,
      dueDate,
      arrIdAssignee,
      status,
    }: {
      note: string;
      dueDate: number | undefined;
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
    const id: number = Number(params.id);
    const validation = await editNoteScheme.safeParseAsync({
      id: id,
      dueDate: dueDate ? dueDate : undefined,
      arrIdAssignee: arrIdAssignee ? arrIdAssignee : undefined,
      note,
      status: status,
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
    const editNote = await prisma.$transaction(async (tx) => {
      const usersOfNote = await prisma.noteUser.findMany({
        where: {
          idNote: id,
        },
      });
      // const dataNote: any = {
      //   note,
      //   dueDate: dueDate ? dueDate : 0,
      //   status,
      //   noteUsers: {},
      // };

      // check same user
      for (let i = 0; i < usersOfNote.length; i++) {
        const oldUser = usersOfNote[i];
        const idOldUser = oldUser.idUser;
        for (let j = 0; j < arrIdAssignee.length; j++) {
          const idNewUser = arrIdAssignee[j];
          if (idOldUser == idNewUser) {
            usersOfNote.splice(i, 1);
            i--;
            arrIdAssignee.splice(j, 1);
            j--;
          }
        }
      }
      const promiseArr = [];
      // old user
      // ----- do sth with usersOfNote
      if (usersOfNote.length) {
        const arrIdOld = [];
        for (let user of usersOfNote) {
          const { id } = user;
          arrIdOld.push(id);
        }
        const newNoteUser = tx.noteUser.deleteMany({
          where: { id: { in: arrIdOld } },
        });
        promiseArr.push(newNoteUser);
      }
      // new user
      // -----do sth with arridAssignee

      if (arrIdAssignee.length) {
        const newData = [];
        for (let idAssignee of arrIdAssignee) {
          newData.push({ idNote: id, idUser: idAssignee });
        }
        const newNoteUser = tx.noteUser.createMany({
          data: newData,
        });
        promiseArr.push(newNoteUser);
      }
      const currentTime = moment().unix();
      const specificNote = tx.notes.update({
        where: {
          id,
        },
        data: {
          note,
          dueDate: dueDate ? dueDate : 0,
          status,
          updatedBy: Number(user?.id),
          updatedTime: currentTime,
        },
      });
      promiseArr.push(specificNote);
      const result = await Promise.all(promiseArr);
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id: number = Number(params.id);
    const validation = await deleteNoteScheme.safeParseAsync({
      id: id,
    });
    if (!validation.success) {
      return NextResponse.json(
        { status: 402, error: true, message: "Thiếu dữ liệu" },
        { status: 402 }
      );
    }
    const deleteNote = await prisma.notes.delete({
      where: {
        id,
      },
    });
    if (deleteNote) {
      return NextResponse.json(
        { status: 200, error: false, message: "Thành công" },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { status: 400, error: true, message: "Thất bại" },
        { status: 400 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { status: 400, error: true, message: "Có lỗi", errors: err },
      { status: 400 }
    );
  }
}
