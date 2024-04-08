"use client";
import { User } from "@/interfaces";
import { signOut } from "next-auth/react";

// next-auth
export default function Logout() {
  function logout() {
    signOut();
  }
  return (
    <button
      onClick={() => logout()}
      className="bg-red-500 me-2 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full"
    >
      Đăng xuất
    </button>
  );
}
