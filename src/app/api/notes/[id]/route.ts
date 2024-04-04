import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'
import { z } from "zod";
// validation
const editNoteScheme = z.object({
  id:z.number().refine(async (id)=>{
    const note = await prisma.notes.findUnique({
      where: {
        id,
      },
    })
    if(!note){
      return false
    }
    return true
  }),
  dueDate:z.number().optional(),
  idAssignee: z.number().refine(async (data)=>{
    const user = await prisma.users.findUnique({
      where: {
        id: data,
      },
    })
    if(!user){
      return false
    }
    return true
  }),
  note: z.string(),
  status:z.number().refine((status)=>{
    if(status<1 && status>3){
      return false
    }
    return true
  })
})
const prisma = new PrismaClient()
export async function PUT(request: NextRequest, { params }: { params: { id: string }  }) {
  try{
    const res = await request.json()
    const {note,
      dueDate,
      idAssignee,
      status} = res
    const id: number = Number(params.id);
    const validation = await editNoteScheme.parseAsync({
      id:Number(id),
      dueDate:dueDate?Number(dueDate):undefined,
      idAssignee:Number(idAssignee),
      note,
      status:Number(status)
    })
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
      return NextResponse.json({error:false, status:200, message:"Thành công"}, {status:200})
    }else{
      return NextResponse.json({status:400,error:true, message:"Thất bại"}, {status:400})
    }
  }catch(err){
    return NextResponse.json({status:400,error:true, message:"Có lỗi",errors:err}, {status:400})
  }
 
}
export async function DELETE(request: NextRequest, { params }: { params: { id: string }  }) {
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
  const deleteNote = await prisma.notes.delete({
    where: {
      id,
    }
  })
  if(deleteNote){
    return NextResponse.json({status:200,error:false, message:"Thành công"}, {status:200})
  }else{
    return NextResponse.json({status:400,error:true, message:"Thất bại"}, {status:400})
  }
}