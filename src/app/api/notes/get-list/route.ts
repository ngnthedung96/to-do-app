import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from 'next/server'
import { z } from "zod";
const prisma = new PrismaClient()
const getListNoteScheme = z.object({
  limit: z.number(),
  page: z.number(),
  dueDate:z.string().optional().refine((dateString)=>{
    if(dateString){
      const dateArr = dateString.split("-")
      const start = moment(dateArr[0], "DD/MM/YYYY", true).isValid();
      const end = moment(dateArr[1], "DD/MM/YYYY", true).isValid();
      if(!start || !end){
        return false
      }
    }
    return true
  }),
  status: z.number().optional(),
  idAssignee: z.number().optional(),
  note: z.string().optional()
})
export async function GET(request: NextRequest, response: NextResponse) {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit')
  const page = searchParams.get('page')
  const dueDate = searchParams.get('dueDate')
  const status = searchParams.get('status')
  const idAssignee = searchParams.get('idAssignee')
  const note = searchParams.get('note')
  const validation = getListNoteScheme.safeParse({
    limit:Number(limit),
    page:Number(page),
    dueDate:dueDate?dueDate:undefined,
    status:status?Number(status):undefined,
    idAssignee:idAssignee?Number(idAssignee):undefined,
    note:note?note:undefined
  })
  if(!validation.success
  ){
    return NextResponse.json({ status:402,error:true, message:"Thiếu dữ liệu"}, {status:402})
  }
  let objCondition:any = {
  }
  if(dueDate||
    status||
    idAssignee||
    note){
    if(note){
      objCondition.note = {
        contains:note
      }
    }else{
      if(dueDate){
        const dateArr = dueDate.split("-")
        const startDate = dateArr[0];
        const formattedStartDate = moment(startDate, "DD/MM/YYYY")
          .startOf("days")
          .unix();
        const endDate = dateArr[1];
        const formattedEndDate = moment(endDate, "DD/MM/YYYY")
          .endOf("days")
          .unix();
        if(startDate && endDate){
          objCondition = {...objCondition, AND: [{ dueDate: { lte:Number(formattedEndDate)} }, { dueDate: { gte:Number(formattedStartDate)} }]}
        }
      }
      if(status){
        objCondition.status = Number(status)
      }
      if(idAssignee){
        objCondition.idAssignee = Number(idAssignee)
      }
    }
  }
  const skip = (Number(page) - 1)*Number(limit)
  const data = await prisma.$transaction([
    prisma.notes.count({
      where:objCondition
    }),
    prisma.notes.findMany(
      {
        where:objCondition,
        skip: skip,
        take: Number(limit),
        include: {
          user:true
        },
        orderBy:[
          {
            id: 'desc'
          }
        ]
      }
    )
  ])
  const totalNote = data[0]
  const listNote = data[1]
  return NextResponse.json({data:{
    totalNote,
    listNote,
    page:Number(page),
    limit:Number(limit),
  },error:false, status:200, message:"Thành công"}, {status:200})
}