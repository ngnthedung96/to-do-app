import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()
export async function PUT(request: NextRequest, { params }: { params: { id: string }  }) {
  const res = await request.json()
  const {note,
    dueDate,
    idAssignee,
    status} = res
  if(!idAssignee ||
    !note|| !status
  ){
    return NextResponse.json({ status:402, message:"Thiếu dữ liệu"}, {status:402})
  }
  if(status != 1 && status != 2 && status != 3){
    return NextResponse.json({ status:402, message:"Trạng thái không hợp lệ"}, {status:402})
  }
  const id: number = Number(params.id);
  // check id
  if(!id){
    return NextResponse.json({ status:402, message:"Thiếu id ghi chú"}, {status:402})
  }
  const findedNote = await prisma.notes.findUnique({
    where: {
      id,
    },
  })
  if(!findedNote){
    return NextResponse.json({ status:400, message:"Không tìm thấy ghi chú"}, {status:400})
  }
  // check user
  const user = await prisma.users.findUnique({
    where: {
      id: idAssignee,
    },
  })
  if(!user){
    return NextResponse.json({status:400, message:"Không tìm thấy người thực hiện"}, {status:400})
  }
  const specificNote = await prisma.notes.update({
    where: {
      id,
    },
    data:{
      note,
      dueDate:dueDate?dueDate:0,
      idAssignee,
      status
    }
  })
  if(specificNote){
    return NextResponse.json({data:specificNote, status:200, message:"Thành công"}, {status:200})
  }else{
    return NextResponse.json({status:400, message:"Thất bại"}, {status:400})
  }
 
  
 
 
}