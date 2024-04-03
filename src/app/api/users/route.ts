import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()
export async function POST(request: NextRequest, response: NextResponse) {
  const res = await request.json()
  const {name} = res
  if(!name
  ){
    return NextResponse.json({ status:402, message:"Thiếu dữ liệu"}, {status:402})
  }
  const newUser =  await prisma.users.create({
    data: {
      name
    },
  })
  if(newUser){
    return NextResponse.json({data:newUser, status:200, message:"Thành công"}, {status:200})
  }else{
    return NextResponse.json({status:400, message:"Thất bại"}, {status:400})
  }
}