"use client";
import { User } from "@/interfaces";

import Navbar from "./navbar";
import Projects from "./projects/page";
export default async function Home({ userData }: { userData: User }) {
  return (
    <main className="flex min-h-screen flex-col justify-center p-24">
      <div className="mb-5">
        <Navbar userData={userData} />
      </div>
      <Projects />
    </main>
  );
}
