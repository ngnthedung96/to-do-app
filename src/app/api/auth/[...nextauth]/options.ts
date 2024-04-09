import { PrismaClient } from "@prisma/client";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
export const options: NextAuthOptions = {
  session: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    updateAge: 24 * 60 * 60, // 24 hours
  },
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        id: {},
        email: {},
        password: {},
      },
      async authorize(credentials, req) {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials) {
          throw new Error("Thiếu dữ liệu");
        }
        const { password, email } = credentials;
        if (password && email) {
          // Any object returned will be saved in `user` property of the JWT
          const user = await prisma.users.findFirst({
            where: {
              email,
            },
          });
          if (!user) {
            throw new Error("Không tìm thấy người dùng");
          }
          const { password: currentPass } = user;
          const checkPassword = await bcrypt.compare(password, currentPass);
          if (checkPassword) {
            return {
              id: `${user.id}`,
              name: user.name,
              email: user.email,
            };
          }
          throw new Error("Sai mật khẩu");
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: Number(token.sub),
        },
      };
    },
  },
  secret: process.env.NEXT_AUTH_SECRET,
};

export const getUser = () => {
  return getServerSession(options);
};
