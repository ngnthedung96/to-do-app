// next-auth
import { options } from "./api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
// pages
import LoginPage from "./login/page";
import Home from "./home";

import { User } from "@/interfaces";

export default async function Page() {
  const session: { user: User } | null = await getServerSession(options);
  const userData: User | undefined = session?.user;
  return userData ? <Home userData={userData} /> : <LoginPage />;
}
