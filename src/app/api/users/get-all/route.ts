import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from 'next/server'
const prisma = new PrismaClient()
export async function GET(request: NextRequest, response: NextResponse) {
  const data = await prisma.users.findMany(
   
  )

  return NextResponse.json({data:data,error:false, status:200, message:"Thành công"}, {status:200})
}