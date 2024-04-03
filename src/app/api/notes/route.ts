import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()
export async function POST(request: NextRequest, response: NextResponse) {
  const res = await request.json()
  const {note,
    dueDate,
    idAssignee} = res
  if(!idAssignee ||
    !note
  ){
    return NextResponse.json({ status:402, message:"Thiếu dữ liệu"}, {status:402})
  }
  // By ID
  const user = await prisma.users.findUnique({
    where: {
      id: idAssignee,
    },
  })
  if(!user){
    return NextResponse.json({status:400, message:"Không tìm thấy người thực hiện"}, {status:400})
  }
  const newNote =  await prisma.notes.create({
    data: {
      note,
      status:1,
      dueDate: dueDate?dueDate:0,
      idAssignee,
    },
  })
  if(newNote){
    return NextResponse.json({data:newNote, status:200, message:"Thành công"}, {status:200})
  }else{
    return NextResponse.json({status:400, message:"Thất bại"}, {status:400})
  }
}