import React from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"

export default async function page() {
  const session = await getServerSession(authOptions)
  return (
    <section className="hidden flex-1 flex-col items-center justify-center lg:flex">
      <h1 className="text-2xl font-bold">Welcome To Resalah</h1>
      <p className="mt-6 max-w-2xl text-center text-muted-foreground">
        Stay connected with friends, family, and colleagues seamlessly, anytime,
        anywhere. With a sleek and user-friendly interface, our chat app offers
        real-time messaging!
      </p>
    </section>
  )
}
