import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from 'next/server'
const prisma = new PrismaClient()
export async function GET(request: NextRequest, response: NextResponse) {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit')
  const page = searchParams.get('page')
  const dueDate = searchParams.get('dueDate')
  const status = searchParams.get('status')
  const idAssignee = searchParams.get('idAssignee')
  const note = searchParams.get('note')
  if(!Number(limit)  || !Number(page) ){
    return NextResponse.json({status:402, message:"Thiếu giới hạn hoặc số trang"}, {status:402})
  }
  let objCondition:any = {
  }
  if(dueDate||
    status||
    idAssignee||
    note){
    if(note){
      objCondition.note = note
    }else{
      if(dueDate){
        const dateArr = dueDate.split("-")
        const start = moment(dateArr[0], "DD/MM/YYYY", true).isValid();
        const end = moment(dateArr[1], "DD/MM/YYYY", true).isValid();
        if(!start || !end){
          return NextResponse.json({status:402, message:"Lọc ngày hết hạn không hợp lệ"}, {status:402})
        }
        const startDate = dateArr[0];
        const formattedStartDate = moment(startDate, "DD/MM/YYYY")
          .startOf("days")
          .unix();
        const endDate = dateArr[1];
        const formattedEndDate = moment(endDate, "DD/MM/YYYY")
          .endOf("days")
          .unix();
          console.log(formattedStartDate , formattedEndDate, 1712139617)
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
    limit:Number(limit)
  }, status:200, message:"Thành công"}, {status:200})
}