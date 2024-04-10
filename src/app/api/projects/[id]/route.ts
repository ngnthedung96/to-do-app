import { PrismaClient, NoteStatus } from "@prisma/client";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getUser } from "../../auth/[...nextauth]/options";
import moment from "moment";
// ----------------------------------validation---------------------------
// edit
const editProjectScheme = z.object({
  id: z.number().refine(async (id) => {
    const project = await prisma.projects.findUnique({
      where: {
        id,
      },
    });
    return project ? true : false;
  }),
  arrIdAssignee: z.array(z.number()).nonempty(),
  name: z.string(),
});
// delete
const deleteProjectScheme = z.object({
  id: z.number().refine(async (id) => {
    const project = await prisma.projects.findUnique({
      where: {
        id,
      },
    });
    return project ? true : false;
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
    const id: number = Number(params.id);
    const validation = await editProjectScheme.safeParseAsync({
      id: id,
      arrIdAssignee: arrIdAssignee ? arrIdAssignee : undefined,
      name,
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
      const usersOfproject = await prisma.projectUser.findMany({
        where: {
          idProject: id,
        },
      });
      // check same user
      for (let i = 0; i < usersOfproject.length; i++) {
        const oldUser = usersOfproject[i];
        const idOldUser = oldUser.idUser;
        for (let j = 0; j < arrIdAssignee.length; j++) {
          const idNewUser = arrIdAssignee[j];
          if (idOldUser == idNewUser) {
            usersOfproject.splice(i, 1);
            i--;
            arrIdAssignee.splice(j, 1);
            j--;
          }
        }
      }
      const promiseArr = [];
      // old user
      // ----- do sth with usersOfproject
      if (usersOfproject.length) {
        const arrIdOld = [];
        for (let user of usersOfproject) {
          const { id } = user;
          arrIdOld.push(id);
        }
        const newProjectUser = tx.projectUser.deleteMany({
          where: { id: { in: arrIdOld } },
        });
        const newNoteUser = tx.noteUser.deleteMany({
          where: { idProjectUser: { in: arrIdOld } },
        });
        promiseArr.push(newNoteUser, newProjectUser);
      }
      // new user
      // -----do sth with arridAssignee

      if (arrIdAssignee.length) {
        const newData = [];
        for (let idAssignee of arrIdAssignee) {
          newData.push({ idProject: id, idUser: idAssignee });
        }
        const newProjectUser = tx.projectUser.createMany({
          data: newData,
        });
        promiseArr.push(newProjectUser);
      }
      const currentTime = moment().unix();
      const specificNote = tx.projects.update({
        where: {
          id,
        },
        data: {
          name,
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
    console.log(err);
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
    const validation = await deleteProjectScheme.safeParseAsync({
      id: id,
    });
    if (!validation.success) {
      return NextResponse.json(
        { status: 402, error: true, message: "Thiếu dữ liệu" },
        { status: 402 }
      );
    }
    const deleteNoteProcess = await prisma.$transaction(async (tx) => {
      const allProjectUser = await prisma.projectUser.findMany({
        where: {
          idProject: id,
        },
        select: {
          id: true,
        },
      });
      if (allProjectUser) {
        const arrIdProjectUser = [];
        for (let projectUser of allProjectUser) {
          arrIdProjectUser.push(projectUser.id);
        }
        if (arrIdProjectUser.length) {
          const deleteNoteUser = await prisma.noteUser.deleteMany({
            where: {
              idProjectUser: {
                in: arrIdProjectUser,
              },
            },
          });
        }
      }
      const deleteProjectUser = await prisma.projectUser.deleteMany({
        where: {
          idProject: id,
        },
      });
      const deleteNote = await prisma.projects.deleteMany({
        where: {
          id,
        },
      });
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
