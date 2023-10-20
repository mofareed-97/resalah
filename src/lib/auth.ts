import { redirect } from "next/navigation"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcrypt"
import { DefaultSession, NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"

import { env } from "../env.mjs"
import db from "./db"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string | null
      username: string | null
      bio: string | null
      email: string
      emailVerified: Date | null
      image: string | null

      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"]
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid Credentials")
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials?.email,
          },
        })

        if (!user || !user.hashedPassword) {
          throw new Error("Invalid Credentials")
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValidPassword) {
          throw new Error("Invalid Credentials")
        }

        return user
      },
    }),

    GithubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET,
    }),

    GoogleProvider({
      clientId: env.GOOGLE_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  debug: process.env.NODE_ENV === 'development',
  
  session:{
    strategy:'jwt'
  },

  secret: env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/signin",
  },

}
