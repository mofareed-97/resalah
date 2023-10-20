"use server"

import bcrypt from "bcrypt"
import { z } from "zod"

import db from "@/lib/db"
import { signUpSchema } from "@/lib/validation/auth"

import getSession from "./getSession"

export async function createAccount(
  input: Omit<z.infer<typeof signUpSchema>, "confirmPassword">
) {
  const { email, name, password } = input
  if (!email || !name || !password) {
    throw new Error("Required Field missing")
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    })

    return user
  } catch (err: any) {
    throw new Error(err)
  }
}

export async function getUsers() {
  const session = await getSession()
  if (!session?.user.email) {
    return []
  }

  try {
    const users = await db.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        NOT: {
          email: session.user.email,
        },
      },
    })

    return users
  } catch (err: any) {
    return []
  }
}

export async function updateUser(name: string) {
  const session = await getSession()
  if (!session?.user.email) {
    throw new Error("Unautorized")
  }

  try {
    await db.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name,
      },
    })
  } catch (err: any) {
    throw new Error(err)
  }
}
