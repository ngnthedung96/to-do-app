import { NextRequest, NextResponse } from "next/server";
const allowedOrigins = ["http://localhost:3000","https://to-do-4z1k9iq89-ngnthedungs-projects.vercel.app"]
export function middleware(request:NextRequest){
  // retrieve the current response
  const res = NextResponse.next()

  // retrieve the HTTP "Origin" header 
  // from the incoming request
 const origin =  request.headers.get("origin")
  // if the origin is an allowed one,
  // add it to the 'Access-Control-Allow-Origin' header
  if (origin && allowedOrigins.includes(origin)) {
    res.headers.append('Access-Control-Allow-Origin', origin);
  }

  // add the remaining CORS headers to the response
  res.headers.append('Access-Control-Allow-Credentials', "true")
  res.headers.append('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  res.headers.append(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  return res
}
export const config = {
  matcher: ['/api/:path*'],
}