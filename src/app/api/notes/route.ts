import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'
import { z } from "zod";
const addNoteScheme = z.object({
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
  note: z.string()
})
const prisma = new PrismaClient()
export async function POST(request: NextRequest, response: NextResponse) {
  try{
    const res = await request.json()
    const {note,
      dueDate,
      idAssignee} = res
    const validation = await addNoteScheme.parseAsync({
        dueDate:dueDate?Number(dueDate):undefined,
        idAssignee:Number(idAssignee),
        note
    })
    const newNote =  await prisma.notes.create({
      data: {
        note,
        status:1,
        dueDate: dueDate?dueDate:0,
        idAssignee,
      },
    })
    if(newNote){
      return NextResponse.json({data:newNote,error:false, status:200, message:"Thành công"}, {status:200})
    }else{
      return NextResponse.json({status:400,error:true, message:"Thất bại"}, {status:400})
    }
  }
  catch(err){
    return NextResponse.json({status:400,error:true, message:"Có lỗi"}, {status:400})
  }
}