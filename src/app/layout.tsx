import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/provider";
import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { User } from "@/interfaces";
import LoginPage from "./login/page";
import Navbar from "./navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session: { user: User } | null = await getServerSession(options);
  const userData: User | undefined = session?.user;
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {userData ? (
            <main className="flex min-h-screen flex-col justify-center p-24">
              <div className="mb-5">
                <Navbar userData={userData} />
              </div>
              {children}
            </main>
          ) : (
            <LoginPage />
          )}
        </ReduxProvider>
      </body>
    </html>
  );
}
