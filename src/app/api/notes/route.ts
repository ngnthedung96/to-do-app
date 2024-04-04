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
  note: z.string(),
  status:z.number().refine((status)=>{
    if(status<1 && status>3){
      return false
    }
    return true
  })
})
const prisma = new PrismaClient()
export async function POST(request: NextRequest, response: NextResponse) {
  try{
    const res = await request.json()
    const {note,
      dueDate,
      idAssignee,
      status} = res
    const formattedDueDate = Number(dueDate)
    const formattedIdAssignee = Number(idAssignee)
    const formattedStatus = Number(status)
    const validation = await addNoteScheme.parseAsync({
        dueDate:formattedDueDate?formattedDueDate:undefined,
        idAssignee:formattedIdAssignee,
        note,
        status:formattedStatus
    })
    const newNote =  await prisma.notes.create({
      data: {
        note,
        status,
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