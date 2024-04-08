"use client";
import { User } from "@/interfaces";
import Logout from "./logout";

// next-auth
export default function Navbar({ userData }: { userData: User }) {
  return (
    <div className="w-full rounded  shadow-lg bg-zinc-50 text-end p-5">
      <span className="me-5">{userData?.name}</span>
      <Logout />
    </div>
  );
}
