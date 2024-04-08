"use client";
import { User } from "@/interfaces";

import Notes from "@/app/notes";
import Navbar from "./navbar";
export default async function Home({ userData }: { userData: User }) {
  return (
    <main className="flex min-h-screen flex-col justify-center p-24">
      <div className="mb-5">
        <Navbar userData={userData} />
      </div>
      <Notes />
    </main>
  );
}
