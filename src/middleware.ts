import { NextRequest, NextResponse } from "next/server";
export function middleware(request:NextRequest){
  // if (request.nextUrl.pathname.startsWith('/api')) {
  //   console.log(request.nextUrl.pathname)
  // }
  return NextResponse.next()
}
export const config = {
  matcher: ['/api/:path*'],
}