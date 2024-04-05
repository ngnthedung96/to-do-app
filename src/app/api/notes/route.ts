import { PrismaClient } from "@prisma/client";
import moment from "moment";
import { NextRequest, NextResponse } from 'next/server'
import { z } from "zod";
// validation
// add
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
// get
const getListNoteScheme = z.object({
  limit: z.number().optional(),
  page: z.number().optional(),
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


export async function GET(request: NextRequest, response: NextResponse) {
  try{
    const searchParams = request.nextUrl.searchParams
    const limit: string|null = searchParams.get('limit')
    const page: string|null = searchParams.get('page')
    const dueDate: string|null = searchParams.get('dueDate')
    const status: string|null = searchParams.get('status')
    const idAssignee: string|null = searchParams.get('idAssignee')
    const note: string|null = searchParams.get('note')
    // format
    const formattedLimit = limit?Number(limit):undefined
    const formattedPage = page?Number(page):undefined
    const formattedStatus = status?Number(status):undefined
    const formattedIdAssignee = idAssignee?Number(idAssignee):undefined
    const validation = getListNoteScheme.safeParse({
      limit:formattedLimit?formattedLimit:undefined,
      page:formattedPage?formattedPage:undefined,
      dueDate:dueDate?dueDate:undefined,
      status:formattedStatus?formattedStatus:undefined,
      idAssignee:formattedIdAssignee?formattedIdAssignee:undefined,
      note:note?note:undefined
    })
    if(!validation.success
    ){
      return NextResponse.json({ status:402,error:true, message:"Thiếu dữ liệu"}, {status:402})
    }
    const currentTime = moment().unix()
    let objCondition:any = {
    }
    // condition
    if(dueDate||
      status||
      idAssignee||
      note){
      if(note){
        objCondition.note = {
          contains:note
        }
      }else{
        if(formattedStatus == 4 && dueDate){
          const dateArr = dueDate.split("-")
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
            AND :[
              {
                NOT:{
                  dueDate:0
                }
              },
              {
                NOT:{
                  status:3
                }
              },
              { dueDate: { lte:Number(currentTime)} },
              { dueDate: { gte:Number(formattedStartDate)}}

            ]
          }
        }else{
          if(formattedStatus){
            if(formattedStatus == 4){
              objCondition = {
                ...objCondition,
                AND :[
                  {
                    NOT:{
                      dueDate:0
                    }
                  },
                  {
                    NOT:{
                      status:3
                    }
                  },
                  {
                    dueDate:{
                      lt:currentTime
                    }
                  },
  
                ]
              }
            }
            else if(formattedStatus > 0 && formattedStatus < 4){
              objCondition.status = Number(status)
            }
          }
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
        }
        if(idAssignee){
          objCondition.idAssignee = formattedIdAssignee
        }
      }
    }
    const query:any = {
      where:objCondition,
      include: {
        user:true
      },
      orderBy:[
        {
          id: 'desc'
        }
      ]
    }
    // pagination
    if(formattedLimit && formattedPage){
      const skip = (formattedPage - 1)*formattedLimit
      query.skip =  skip
      query.take =  formattedLimit
    }
    const data = await prisma.$transaction([
      prisma.notes.count({
        where:objCondition
      }),
      prisma.notes.findMany(
        query
      )
    ])
    const totalNote = data[0]
    const listNote = data[1]
    return NextResponse.json({data:{
      totalNote,
      listNote,
      page:formattedPage,
      limit:formattedLimit,
      objCondition,
      query
    },error:false, status:200, message:"Thành công"}, {status:200})
  } catch(err){
    console.log(err)
    return NextResponse.json({status:400,error:true, message:"Có lỗi"}, {status:400})
  }
  
}